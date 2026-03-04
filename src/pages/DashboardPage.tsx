import { useQuery, useMutation } from '@tanstack/react-query';
import {
  getDashboard,
  getDomeggookStatus,
  domeggookLogin as apiDomeggookLogin,
  manualCheck as apiManualCheck,
  manualTracking as apiManualTracking,
} from '../api/dashboard';
import StatusBadge from '../components/StatusBadge';
import { useToast } from '../components/Toast';

function shortDate(dt: string | null): string {
  if (!dt) return '-';
  return dt.replace('T', ' ').slice(0, 16);
}

export default function DashboardPage() {
  const { showToast } = useToast();

  const {
    data: dashboard,
    isLoading: dashLoading,
    error: dashError,
  } = useQuery({ queryKey: ['dashboard'], queryFn: getDashboard });

  const { data: domeStatus, refetch: refetchDome } = useQuery({
    queryKey: ['domeggook-status'],
    queryFn: getDomeggookStatus,
  });

  const loginMutation = useMutation({
    mutationFn: apiDomeggookLogin,
    onSuccess: (data) => {
      showToast(data.message);
      refetchDome();
    },
    onError: (err: Error) => showToast('로그인 실패: ' + err.message, 'error'),
  });

  const checkMutation = useMutation({
    mutationFn: apiManualCheck,
    onSuccess: (data) => showToast(data.message),
    onError: (err: Error) => showToast('실행 실패: ' + err.message, 'error'),
  });

  const trackingMutation = useMutation({
    mutationFn: apiManualTracking,
    onSuccess: (data) => showToast(data.message),
    onError: (err: Error) => showToast('실행 실패: ' + err.message, 'error'),
  });

  const domeLoggedIn = domeStatus?.logged_in ?? false;

  return (
    <>
      <div className="btn-group">
        <button
          className="btn btn-primary"
          onClick={() => checkMutation.mutate()}
          disabled={checkMutation.isPending}
        >
          {checkMutation.isPending ? '실행 중...' : '주문 확인 실행'}
        </button>
        <button
          className="btn btn-primary"
          onClick={() => trackingMutation.mutate()}
          disabled={trackingMutation.isPending}
        >
          {trackingMutation.isPending ? '실행 중...' : '송장 수집 실행'}
        </button>

        {domeStatus !== undefined && (
          <>
            <span
              className={`badge ${domeLoggedIn ? 'badge-shipped' : 'badge-error'}`}
              style={{ marginLeft: '8px', lineHeight: '32px' }}
            >
              도매매: {domeLoggedIn ? '로그인됨' : '로그아웃'}
            </span>
            {!domeLoggedIn && (
              <button
                className="btn btn-primary"
                onClick={() => loginMutation.mutate()}
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? '브라우저 열림 - 로그인 대기 중...' : '도매매 로그인'}
              </button>
            )}
          </>
        )}
      </div>

      {dashLoading && (
        <div className="cards">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card">
              <div className="skeleton skeleton-card" />
            </div>
          ))}
        </div>
      )}

      {dashError && (
        <div className="empty">대시보드 로드 실패</div>
      )}

      {dashboard && (
        <>
          <div className="cards">
            <div className="card">
              <div className="label">전체</div>
              <div className="value">{dashboard.total_orders}</div>
            </div>
            {Object.entries(dashboard.status_summary).map(([status, count]) => (
              <div key={status} className="card">
                <div className="label">{status}</div>
                <div className="value">{count}</div>
              </div>
            ))}
          </div>

          <div className="section-title">최근 주문</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>출처</th>
                  <th>주문번호</th>
                  <th>상품명</th>
                  <th>수량</th>
                  <th>수령인</th>
                  <th>상태</th>
                  <th>송장번호</th>
                  <th>등록일</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.recent_orders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="empty">주문이 없습니다</td>
                  </tr>
                ) : (
                  dashboard.recent_orders.map((o) => (
                    <tr key={o.id}>
                      <td>{o.id}</td>
                      <td>{o.source || 'naver'}</td>
                      <td>{o.naver_order_id || '-'}</td>
                      <td>{o.product_name || '-'}</td>
                      <td>{o.quantity}</td>
                      <td>{o.recipient_name || '-'}</td>
                      <td><StatusBadge status={o.status} /></td>
                      <td>{o.tracking_number || '-'}</td>
                      <td>{shortDate(o.created_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
