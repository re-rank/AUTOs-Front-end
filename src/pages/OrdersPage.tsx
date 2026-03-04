import { useQuery } from '@tanstack/react-query';
import { getOrders } from '../api/orders';
import StatusBadge from '../components/StatusBadge';

function shortDate(dt: string | null): string {
  if (!dt) return '-';
  return dt.replace('T', ' ').slice(0, 16);
}

export default function OrdersPage() {
  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['orders'],
    queryFn: getOrders,
  });

  return (
    <>
      <div className="section-title">전체 주문</div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>출처</th>
              <th>주문번호</th>
              <th>상품주문번호</th>
              <th>상품명</th>
              <th>수량</th>
              <th>수령인</th>
              <th>연락처</th>
              <th>주소</th>
              <th>상태</th>
              <th>도매매 주문ID</th>
              <th>택배사</th>
              <th>송장번호</th>
              <th>등록일</th>
              <th>수정일</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={15} className="loading-overlay">데이터 로딩 중...</td>
              </tr>
            )}
            {error && (
              <tr>
                <td colSpan={15} className="empty">주문 목록 로드 실패</td>
              </tr>
            )}
            {orders?.length === 0 && (
              <tr>
                <td colSpan={15} className="empty">주문이 없습니다</td>
              </tr>
            )}
            {orders?.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.source || 'naver'}</td>
                <td>{o.naver_order_id || '-'}</td>
                <td>{o.naver_product_order_id || '-'}</td>
                <td>{o.product_name || '-'}</td>
                <td>{o.quantity}</td>
                <td>{o.recipient_name || '-'}</td>
                <td>{o.recipient_phone || '-'}</td>
                <td>{o.recipient_address || '-'}</td>
                <td><StatusBadge status={o.status} /></td>
                <td>{o.domeggook_order_id || '-'}</td>
                <td>{o.tracking_company || '-'}</td>
                <td>{o.tracking_number || '-'}</td>
                <td>{shortDate(o.created_at)}</td>
                <td>{shortDate(o.updated_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
