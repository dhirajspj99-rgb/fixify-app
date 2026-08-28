import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerId, customerPhone, serviceType, biller, accountId, amount } = body;

    if (!customerId || !amount || !accountId || !biller) {
      return NextResponse.json({ success: false, message: 'Invalid payload data' }, { status: 400 });
    }

    // 1. Check Customer Wallet Balance
    const { data: customer, error: custError } = await supabase
      .from('customers')
      .select('balance, id')
      .eq('id', customerId)
      .single();

    if (custError || !customer) {
      return NextResponse.json({ success: false, message: 'Customer not found' }, { status: 404 });
    }

    const currentBalance = Number(customer.balance || 0);
    const billAmount = Number(amount);

    if (currentBalance < billAmount) {
      return NextResponse.json({ success: false, message: 'Insufficient wallet balance' }, { status: 400 });
    }

    // 2. Simulated Operator API Reference (Ready for KiwiK / BBPS API integration)
    const operatorRefId = "TXN_" + Math.floor(Math.random() * 100000000);

    // 3. Deduct Wallet Balance
    const newBalance = currentBalance - billAmount;
    await supabase.from('customers').update({ balance: newBalance }).eq('id', customerId);

    // 4. Insert into bbps_transactions & wallet_transactions
    await supabase.from('bbps_transactions').insert({
      customer_id: customerId,
      customer_phone: customerPhone,
      service_type: serviceType,
      biller_name: biller,
      account_id: accountId,
      amount: billAmount,
      status: 'success',
      operator_ref_id: operatorRefId
    });

    await supabase.from('wallet_transactions').insert({
      user_type: 'customer',
      customer_id: customerId,
      amount: billAmount,
      type: 'debit',
      status: 'completed',
      reason: `BBPS (${serviceType} - ${biller}): ${accountId}`
    });

    return NextResponse.json({ success: true, newBalance, operatorRefId, message: 'Recharge successful' });

  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}