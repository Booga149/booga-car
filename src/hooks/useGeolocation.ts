"use client";
import { useState, useEffect, useCallback } from 'react';

export interface GeolocationPosition {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

export interface GeolocationState {
  position: GeolocationPosition | null;
  error: string | null;
  isLoading: boolean;
  isSupported: boolean;
  permissionState: 'prompt' | 'granted' | 'denied' | 'unknown';
}

/**
 * حساب المسافة بالكيلومتر بين نقطتين (Haversine formula)
 */
export function calculateDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371; // نصف قطر الأرض بالكيلومتر
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round((R * c) * 10) / 10; // تقريب لعشر واحد
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * تنسيق المسافة بشكل قابل للقراءة
 */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} متر`;
  if (km < 10) return `${km.toFixed(1)} كم`;
  return `${Math.round(km)} كم`;
}

/**
 * خطاف React لتحديد الموقع الجغرافي
 */
export function useGeolocation(autoRequest = false) {
  const [state, setState] = useState<GeolocationState>({
    position: null,
    error: null,
    isLoading: false,
    isSupported: typeof window !== 'undefined' && 'geolocation' in navigator,
    permissionState: 'unknown',
  });

  // فحص حالة الإذن
  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.permissions) return;

    navigator.permissions.query({ name: 'geolocation' }).then((result) => {
      setState(prev => ({ ...prev, permissionState: result.state as any }));

      result.onchange = () => {
        setState(prev => ({ ...prev, permissionState: result.state as any }));
      };
    }).catch(() => {
      // بعض المتصفحات لا تدعم permissions API
    });
  }, []);

  // طلب الموقع تلقائياً إذا كان الإذن ممنوح مسبقاً
  useEffect(() => {
    if (autoRequest && state.permissionState === 'granted') {
      requestLocation();
    }
  }, [autoRequest, state.permissionState]);

  const requestLocation = useCallback(() => {
    if (!state.isSupported) {
      setState(prev => ({
        ...prev,
        error: 'المتصفح لا يدعم تحديد المواقع',
      }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState(prev => ({
          ...prev,
          position: {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            timestamp: pos.timestamp,
          },
          isLoading: false,
          error: null,
          permissionState: 'granted',
        }));
      },
      (err) => {
        let errorMsg = 'حدث خطأ في تحديد الموقع';
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMsg = 'تم رفض إذن تحديد الموقع';
            break;
          case err.POSITION_UNAVAILABLE:
            errorMsg = 'الموقع غير متاح حالياً';
            break;
          case err.TIMEOUT:
            errorMsg = 'انتهت مهلة تحديد الموقع';
            break;
        }
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: errorMsg,
          permissionState: err.code === err.PERMISSION_DENIED ? 'denied' : prev.permissionState,
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 دقائق cache
      }
    );
  }, [state.isSupported]);

  return {
    ...state,
    requestLocation,
  };
}
