import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import * as XLSX from 'npm:xlsx@0.18.5';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        // Only admins can access this
        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
        }

        // Calculate the most recent Sunday 12:00 PM cutoff
        const now = new Date();
        const mostRecentSundayCutoff = new Date(now);
        
        // Find the most recent Sunday
        const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const daysToSubtract = dayOfWeek === 0 ? 0 : dayOfWeek;
        mostRecentSundayCutoff.setDate(now.getDate() - daysToSubtract);
        mostRecentSundayCutoff.setHours(12, 0, 0, 0); // Set to 12:00 PM
        
        // If we haven't reached this Sunday's cutoff yet, go back to previous Sunday
        if (now < mostRecentSundayCutoff) {
            mostRecentSundayCutoff.setDate(mostRecentSundayCutoff.getDate() - 7);
        }

        // Calculate delivery week start (Monday after cutoff)
        const deliveryWeekStart = new Date(mostRecentSundayCutoff);
        deliveryWeekStart.setDate(mostRecentSundayCutoff.getDate() + 1); // Next Monday
        deliveryWeekStart.setHours(0, 0, 0, 0);

        // Calculate delivery week end (following Sunday before cutoff)
        const deliveryWeekEnd = new Date(deliveryWeekStart);
        deliveryWeekEnd.setDate(deliveryWeekStart.getDate() + 6); // Sunday
        deliveryWeekEnd.setHours(23, 59, 59, 999);

        // Calculate week number (ISO 8601)
        const weekNumber = getISOWeek(deliveryWeekStart);
        const year = deliveryWeekStart.getFullYear();
        const orderWeek = `${year}-W${weekNumber.toString().padStart(2, '0')}`;

        console.log('Cutoff date:', mostRecentSundayCutoff.toISOString());
        console.log('Delivery week:', deliveryWeekStart.toISOString(), 'to', deliveryWeekEnd.toISOString());
        console.log('Order week:', orderWeek);

        // Fetch all active subscriptions using service role
        const subscriptions = await base44.asServiceRole.entities.Subscription.filter({
            status: 'active'
        });

        if (!subscriptions || subscriptions.length === 0) {
            return Response.json({ 
                error: 'No orders found for this week',
                weekStart: deliveryWeekStart.toISOString(),
                weekEnd: deliveryWeekEnd.toISOString()
            }, { status: 404 });
        }

        // Fetch all meals to get meal names
        const meals = await base44.asServiceRole.entities.Meal.list();
        const mealMap = {};
        meals.forEach(meal => {
            mealMap[meal.id] = meal.name;
        });

        // Prepare Excel data
        const excelData = [];

        for (const sub of subscriptions) {
            const selectedMealIds = sub.meal_preferences?.selected_meals || [];
            const selectedMealNames = selectedMealIds.map(id => mealMap[id] || id).join(', ');
            
            // Calculate quantity per meal (total meals divided by number of different meals)
            const quantityPerMeal = selectedMealIds.length > 0 
                ? Math.floor(sub.meals_per_week / selectedMealIds.length)
                : 0;

            const deliveryAddress = sub.delivery_address || {};
            const fullAddress = [
                deliveryAddress.street,
                deliveryAddress.city,
                deliveryAddress.state,
                deliveryAddress.zip
            ].filter(Boolean).join(', ');

            excelData.push({
                'Customer Name': sub.user_email.split('@')[0], // Extract name from email or use actual name if available
                'Customer Email': sub.user_email,
                'Subscription Plan': sub.plan_name,
                'Meals Per Week': sub.meals_per_week,
                'Selected Meals': selectedMealNames,
                'Quantity Per Meal': quantityPerMeal,
                'Delivery Day': sub.delivery_schedule?.delivery_day || '',
                'Delivery Time Slot': sub.delivery_schedule?.time_slot || '',
                'Delivery Address': fullAddress,
                'Special Instructions': deliveryAddress.special_instructions || '',
                'Order Week': orderWeek,
                'Subscription Status': sub.status,
                'Order Created Date': sub.created_date ? new Date(sub.created_date).toISOString().split('T')[0] : ''
            });
        }

        // Generate Excel file
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        
        // Auto-size columns
        const maxWidth = 50;
        const columnWidths = [];
        const headers = Object.keys(excelData[0] || {});
        headers.forEach((header, i) => {
            const maxLength = Math.max(
                header.length,
                ...excelData.map(row => String(row[header] || '').length)
            );
            columnWidths.push({ wch: Math.min(maxLength + 2, maxWidth) });
        });
        worksheet['!cols'] = columnWidths;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Weekly Orders');

        // Generate buffer
        const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        // Format filename with cutoff date
        const fileDate = mostRecentSundayCutoff.toISOString().split('T')[0];
        const filename = `AranciniMeals_WeeklyOrders_${fileDate}.xlsx`;

        return new Response(excelBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="${filename}"`,
            }
        });

    } catch (error) {
        console.error('Export error:', error);
        return Response.json({ 
            error: error.message,
            details: error.stack
        }, { status: 500 });
    }
});

// Helper function to calculate ISO week number
function getISOWeek(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return weekNo;
}