import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Verify that the requesting user has the required role.
 * Works by extracting the auth token from the request and checking the user's profile.
 * 
 * @param request - The incoming Next.js request
 * @param allowedRoles - Array of roles allowed to access this route
 * @returns { authorized: boolean, userId?: string, role?: string, error?: NextResponse }
 */
export async function verifyRole(
  request: NextRequest,
  allowedRoles: ('admin' | 'seller' | 'user')[]
): Promise<{
  authorized: boolean;
  userId?: string;
  role?: string;
  error?: NextResponse;
}> {
  try {
    // Extract auth token from Authorization header or cookie
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return {
        authorized: false,
        error: NextResponse.json(
          { error: 'غير مصرح - لم يتم تقديم رمز الدخول' },
          { status: 401 }
        ),
      };
    }

    // Create a Supabase client with the user's token
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    // Get user from token
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        authorized: false,
        error: NextResponse.json(
          { error: 'رمز الدخول غير صالح أو منتهي الصلاحية' },
          { status: 401 }
        ),
      };
    }

    // Get user's role from profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const userRole = profile?.role || 'user';

    // Check if role is allowed
    // Admin always has access
    if (userRole === 'admin' || allowedRoles.includes(userRole)) {
      return { authorized: true, userId: user.id, role: userRole };
    }

    return {
      authorized: false,
      role: userRole,
      userId: user.id,
      error: NextResponse.json(
        { error: 'ليس لديك صلاحية للوصول لهذا المورد', requiredRole: allowedRoles, yourRole: userRole },
        { status: 403 }
      ),
    };
  } catch (err) {
    return {
      authorized: false,
      error: NextResponse.json(
        { error: 'خطأ في التحقق من الصلاحيات' },
        { status: 500 }
      ),
    };
  }
}
