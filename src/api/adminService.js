import { supabase } from '@/lib/supabase';

/**
 * Admin API Service
 * Note: These functions assume the current authenticated user has 'admin' role/permissions
 * validated via RLS policies on the database side.
 */

export const adminService = {
  
  // Staff Management
  async getAllStaff(filters = {}) {
    let query = supabase.from('staff').select('*');
    
    if (filters.status) query = query.eq('current_status', filters.status);
    if (filters.search) query = query.ilike('name', `%${filters.search}%`);
    if (filters.verification) query = query.eq('verification_status', filters.verification);
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getStaffById(id) {
    const { data, error } = await supabase
      .from('staff')
      .select('*, bookings(*), reviews_ratings(*)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async verifyStaff(id, status, notes) {
    const { data, error } = await supabase
      .from('staff')
      .update({ 
        verification_status: status,
        admin_notes: notes,
        verified_at: status === 'verified' ? new Date().toISOString() : null
      })
      .eq('id', id)
      .select();
    if (error) throw error;
    return data;
  },

  async suspendStaff(id, reason) {
    const { data, error } = await supabase
      .from('staff')
      .update({ 
        current_status: 'Suspended',
        admin_notes: reason 
      })
      .eq('id', id)
      .select();
    if (error) throw error;
    return data;
  },

  // Customer Management
  async getCustomers() {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  // Booking Management
  async getBookings(filters = {}) {
    let query = supabase
      .from('bookings')
      .select('*, customer:customers(name, phone), staff:staff(name)');

    if (filters.status) query = query.eq('booking_status', filters.status);
    if (filters.date) query = query.eq('start_date', filters.date);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async manualAssignStaff(bookingId, staffId) {
    // Call Edge Function or direct DB insert depending on architecture
    const { data, error } = await supabase
      .from('staff_assignments')
      .insert({
        booking_id: bookingId,
        staff_id: staffId,
        assignment_status: 'manual_assigned',
        assigned_at: new Date().toISOString()
      })
      .select();
      
    if (error) throw error;
    
    // Update booking status
    await supabase
      .from('bookings')
      .update({ staff_id: staffId, booking_status: 'confirmed' })
      .eq('id', bookingId);
      
    return data;
  },

  // Finance
  async getPayments() {
    const { data, error } = await supabase
      .from('payments')
      .select('*, booking:bookings(booking_reference)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async refundPayment(paymentId, amount) {
    // Typically calls a payment gateway edge function
    const { data, error } = await supabase.functions.invoke('process-payment', {
      body: { payment_id: paymentId, amount, type: 'refund' }
    });
    if (error) throw error;
    return data;
  },

  // Analytics
  async getAnalytics() {
    // Parallel queries for dashboard stats
    const [bookings, revenue, staff, customers] = await Promise.all([
      supabase.from('bookings').select('id', { count: 'exact' }),
      supabase.from('payments').select('amount').eq('payment_status', 'completed'),
      supabase.from('staff').select('id', { count: 'exact' }),
      supabase.from('customers').select('id', { count: 'exact' })
    ]);

    const totalRevenue = revenue.data?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0;

    return {
      totalBookings: bookings.count,
      totalRevenue,
      totalStaff: staff.count,
      totalCustomers: customers.count
    };
  },

  async getAuditLogs() {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) throw error;
    return data;
  }
};