import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, TrendingUp, Package, DollarSign, Award } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

const STATUS_EXCLUDE = new Set(['cancelled']);

export default function MealPopularity() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rankings, setRankings] = useState([]);

  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [orders, meals] = await Promise.all([
        base44.entities.Order.list('-created_date', 500),
        base44.entities.Meal.list('-created_date', 500),
      ]);

      const mealMeta = {};
      (meals || []).forEach((m) => {
        mealMeta[m.id] = {
          name: m.name,
          category: m.category,
          image_url: m.image_url,
          price: m.price,
        };
      });

      const agg = {};
      (orders || []).forEach((order) => {
        if (order.status && STATUS_EXCLUDE.has(order.status)) return;
        (order.items || []).forEach((item) => {
          const key = item.meal_id || item.meal_name || 'unknown';
          if (!agg[key]) {
            agg[key] = {
              meal_id: key,
              meal_name: item.meal_name || mealMeta[key]?.name || 'Unknown Meal',
              total_quantity: 0,
              order_count: 0,
              revenue: 0,
              category: mealMeta[key]?.category || null,
              image_url: mealMeta[key]?.image_url || null,
              unit_price: item.price_per_item ?? mealMeta[key]?.price ?? 0,
            };
          }
          const qty = item.quantity || 0;
          agg[key].total_quantity += qty;
          agg[key].order_count += 1;
          agg[key].revenue += (item.price_per_item || 0) * qty;
        });
      });

      const ranked = Object.values(agg)
        .filter((r) => r.total_quantity > 0)
        .sort((a, b) => b.total_quantity - a.total_quantity);

      setRankings(ranked);
    } catch (e) {
      console.error('Failed to load meal popularity:', e);
      setError('Unable to load order data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const totalMeals = rankings.reduce((s, r) => s + r.total_quantity, 0);
    const totalRevenue = rankings.reduce((s, r) => s + r.revenue, 0);
    const top = rankings[0] || null;
    return { totalMeals, totalRevenue, top, mealCount: rankings.length };
  }, [rankings]);

  const top10 = rankings.slice(0, 10);
  const chartData = top10.map((r) => ({
    name: r.meal_name.length > 18 ? r.meal_name.slice(0, 16) + '…' : r.meal_name,
    quantity: r.total_quantity,
  }));

  const formatMoney = (n) =>
    new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(n || 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadData}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Retry
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Meal Popularity Dashboard</h1>
          <p className="text-gray-600 mt-2">
            See which meals are driving the most orders to plan your weekly menu and inventory.
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Meals Ordered</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalMeals}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">{formatMoney(stats.totalRevenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Unique Meals Ordered</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.mealCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Top Performer</p>
                  <p className="text-lg font-bold text-gray-900 truncate" title={stats.top?.meal_name}>
                    {stats.top?.meal_name || '—'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Top 10 Meals by Quantity Ordered</CardTitle>
              <CardDescription>Ranked by total units sold across all non-cancelled orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v) => [`${v} units`, 'Quantity']} />
                    <Bar dataKey="quantity" radius={[0, 4, 4, 0]}>
                      {chartData.map((_, i) => (
                        <Cell fill={i === 0 ? '#16a34a' : '#86efac'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Full Ranking Table */}
        <Card>
          <CardHeader>
            <CardTitle>Full Meal Ranking</CardTitle>
            <CardDescription>Every meal ordered, sorted by popularity</CardDescription>
          </CardHeader>
          <CardContent>
            {rankings.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No order data available yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-gray-500">
                      <th className="py-3 px-2 font-medium">#</th>
                      <th className="py-3 px-2 font-medium">Meal</th>
                      <th className="py-3 px-2 font-medium">Category</th>
                      <th className="py-3 px-2 font-medium text-right">Units Sold</th>
                      <th className="py-3 px-2 font-medium text-right">Orders</th>
                      <th className="py-3 px-2 font-medium text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankings.map((r, i) => (
                      <tr key={r.meal_id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="py-3 px-2 font-semibold text-gray-400">{i + 1}</td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-3">
                            {r.image_url && (
                              <img
                                src={r.image_url}
                                alt={r.meal_name}
                                className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                              />
                            )}
                            <span className="font-medium text-gray-900">{r.meal_name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-gray-600 capitalize">{r.category || '—'}</td>
                        <td className="py-3 px-2 text-right font-semibold text-gray-900">{r.total_quantity}</td>
                        <td className="py-3 px-2 text-right text-gray-600">{r.order_count}</td>
                        <td className="py-3 px-2 text-right text-gray-900">{formatMoney(r.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}