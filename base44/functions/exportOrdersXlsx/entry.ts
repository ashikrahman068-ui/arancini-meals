import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import * as XLSX from 'npm:xlsx@0.18.5';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Authenticate and verify admin access
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    // Fetch all orders using service role
    const orders = await base44.asServiceRole.entities.Order.list();

    // Transform orders into flat rows for Excel
    const rows = orders.flatMap(order => {
      // If order has multiple items, create a row for each item
      if (order.items && order.items.length > 0) {
        return order.items.map(item => ({
          'Order Number': order.order_number || order.id,
          'Order Date': order.created_date ? new Date(order.created_date).toLocaleString() : '',
          'Customer Email': order.customer_email || '',
          'Customer Name': order.delivery_address?.name || '',
          'Phone': order.delivery_address?.phone || '',
          'Street': order.delivery_address?.street || '',
          'City': order.delivery_address?.city || '',
          'State': order.delivery_address?.state || '',
          'ZIP': order.delivery_address?.zip || '',
          'Meal Name': item.meal_name || '',
          'Quantity': item.quantity || 0,
          'Price Per Item': item.price_per_item || 0,
          'Order Status': order.status || '',
          'Payment Status': order.payment_status || '',
          'Payment Method': order.payment_method || '',
          'Subtotal': order.subtotal || 0,
          'Tax': order.tax || 0,
          'Delivery Fee': order.delivery_fee || 0,
          'Discount': order.discount_amount || 0,
          'Total': order.total || 0,
          'Delivery Date': order.delivery_date || '',
          'Delivery Time Slot': order.delivery_time_slot || '',
          'Special Instructions': order.delivery_address?.special_instructions || '',
          'Notes': order.notes || ''
        }));
      } else {
        // Order without items
        return [{
          'Order Number': order.order_number || order.id,
          'Order Date': order.created_date ? new Date(order.created_date).toLocaleString() : '',
          'Customer Email': order.customer_email || '',
          'Customer Name': order.delivery_address?.name || '',
          'Phone': order.delivery_address?.phone || '',
          'Street': order.delivery_address?.street || '',
          'City': order.delivery_address?.city || '',
          'State': order.delivery_address?.state || '',
          'ZIP': order.delivery_address?.zip || '',
          'Meal Name': '',
          'Quantity': 0,
          'Price Per Item': 0,
          'Order Status': order.status || '',
          'Payment Status': order.payment_status || '',
          'Payment Method': order.payment_method || '',
          'Subtotal': order.subtotal || 0,
          'Tax': order.tax || 0,
          'Delivery Fee': order.delivery_fee || 0,
          'Discount': order.discount_amount || 0,
          'Total': order.total || 0,
          'Delivery Date': order.delivery_date || '',
          'Delivery Time Slot': order.delivery_time_slot || '',
          'Special Instructions': order.delivery_address?.special_instructions || '',
          'Notes': order.notes || ''
        }];
      }
    });

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(rows);

    // Auto-size columns
    const colWidths = [
      { wch: 15 }, // Order Number
      { wch: 20 }, // Order Date
      { wch: 25 }, // Customer Email
      { wch: 20 }, // Customer Name
      { wch: 15 }, // Phone
      { wch: 30 }, // Street
      { wch: 15 }, // City
      { wch: 10 }, // State
      { wch: 10 }, // ZIP
      { wch: 30 }, // Meal Name
      { wch: 10 }, // Quantity
      { wch: 12 }, // Price Per Item
      { wch: 12 }, // Order Status
      { wch: 15 }, // Payment Status
      { wch: 15 }, // Payment Method
      { wch: 12 }, // Subtotal
      { wch: 10 }, // Tax
      { wch: 12 }, // Delivery Fee
      { wch: 10 }, // Discount
      { wch: 12 }, // Total
      { wch: 15 }, // Delivery Date
      { wch: 15 }, // Delivery Time Slot
      { wch: 30 }, // Special Instructions
      { wch: 30 }  // Notes
    ];
    worksheet['!cols'] = colWidths;

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Return as downloadable file
    return new Response(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="orders_export_${new Date().toISOString().split('T')[0]}.xlsx"`
      }
    });

  } catch (error) {
    console.error('Export error:', error);
    return Response.json({ 
      error: 'Failed to export orders', 
      details: error.message 
    }, { status: 500 });
  }
});