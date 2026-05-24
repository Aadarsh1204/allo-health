'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCountdown } from '@/hooks/useCountdown';
import api from '@/lib/api';
import { Reservation } from '@/types';

function CountdownTimer({ expiresAt }: { expiresAt: string }) {
  const { minutes, seconds, isExpired } = useCountdown(expiresAt);

  if (isExpired) {
    return (
      <span className="text-red-500 font-medium">Reservation expired</span>
    );
  }

  return (
    <span className={`font-mono font-medium ${minutes < 2 ? 'text-red-500' : 'text-amber-600'}`}>
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </span>
  );
}

export default function ReservationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get(`/reservations/${id}`)
      .then((res) => setReservation(res.data))
      .catch(() => setError('Reservation not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleConfirm = async () => {
    setActionLoading(true);
    setError(null);
    try {
      const res = await api.post(`/reservations/${id}/confirm`);
      setReservation(res.data);
    } catch (err: any) {
      const status = err.response?.status;
      if (status === 410) {
        setError('This reservation has expired. The hold has been released and stock is available again.');
      } else if (status === 409) {
        setError('This reservation cannot be confirmed in its current state.');
      } else {
        setError(err.response?.data?.message || 'Something went wrong');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    setActionLoading(true);
    setError(null);
    try {
      await api.post(`/reservations/${id}/release`);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading reservation...</div>;
  if (!reservation) return <div className="p-8 text-red-500">{error}</div>;

  const isPending = reservation.status === 'PENDING';

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Reservation Details</h1>

      {error && (
        <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm border border-red-200">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{reservation.product.name}</CardTitle>
            <Badge variant={
              reservation.status === 'CONFIRMED' ? 'secondary' :
              reservation.status === 'RELEASED' ? 'outline' : 'default'
            }>
              {reservation.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Warehouse</p>
              <p className="font-medium">{reservation.warehouse.name}</p>
            </div>
            <div>
              <p className="text-slate-500">Quantity</p>
              <p className="font-medium">{reservation.quantity}</p>
            </div>
            <div>
              <p className="text-slate-500">Price</p>
              <p className="font-medium">Rs. {Number(reservation.product.price).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-slate-500">Total</p>
              <p className="font-medium">
                Rs. {(Number(reservation.product.price) * reservation.quantity).toFixed(2)}
              </p>
            </div>
          </div>

          {isPending && (
            <div className="p-3 bg-amber-50 rounded border border-amber-200">
              <p className="text-sm text-amber-700">
                Time remaining to complete purchase:&nbsp;
                <CountdownTimer expiresAt={reservation.expiresAt} />
              </p>
            </div>
          )}

          {reservation.status === 'CONFIRMED' && (
            <div className="p-3 bg-green-50 rounded border border-green-200">
              <p className="text-sm text-green-700">
                Purchase confirmed on {new Date(reservation.confirmedAt!).toLocaleString()}
              </p>
            </div>
          )}

          {reservation.status === 'RELEASED' && (
            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <p className="text-sm text-slate-600">This reservation has been released.</p>
            </div>
          )}

          {isPending && (
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleConfirm}
                disabled={actionLoading}
                className="flex-1"
              >
                {actionLoading ? 'Processing...' : 'Confirm purchase'}
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancel}
                disabled={actionLoading}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          )}

          {!isPending && (
            <Button variant="outline" onClick={() => router.push('/')} className="w-full">
              Back to Products
            </Button>
          )}
        </CardContent>
      </Card>
    </main>
  );
}