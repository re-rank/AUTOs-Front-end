import { type FormEvent, useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMappings,
  createMapping,
  deleteMapping,
  getNaverProducts,
  type NaverProduct,
} from '../api/mappings';
import { getDomeggookOptions, type DomeggookOption } from '../api/dashboard';
import type { Mapping } from '../types';
import { useToast } from '../components/Toast';

export default function MappingsPage() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [naverLoaded, setNaverLoaded] = useState(false);

  const { data: mappings, isLoading: mappingsLoading } = useQuery({
    queryKey: ['mappings'],
    queryFn: getMappings,
  });

  const { data: naverData, refetch: fetchNaver, isFetching: naverFetching } = useQuery({
    queryKey: ['naver-products'],
    queryFn: () => getNaverProducts(),
    enabled: false,
  });

  const existingMappingsMap: Record<string, Mapping> = {};
  mappings?.forEach((m) => {
    existingMappingsMap[m.naver_product_id] = m;
  });

  async function handleLoadNaver() {
    setNaverLoaded(true);
    await fetchNaver();
  }

  const createMutation = useMutation({
    mutationFn: createMapping,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mappings'] });
      queryClient.invalidateQueries({ queryKey: ['naver-products'] });
      showToast('매핑이 등록되었습니다');
    },
    onError: (err: Error) => showToast('등록 실패: ' + err.message, 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMapping,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mappings'] });
      queryClient.invalidateQueries({ queryKey: ['naver-products'] });
      showToast('매핑이 삭제되었습니다');
    },
    onError: (err: Error) => showToast('삭제 실패: ' + err.message, 'error'),
  });

  // 수동 매핑 폼 상태
  const [form, setForm] = useState({
    source: 'naver',
    naver_product_id: '',
    naver_product_name: '',
    domeggook_url: '',
    domeggook_option: '',
  });

  function handleFormChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleFormSubmit(e: FormEvent) {
    e.preventDefault();
    createMutation.mutate(form);
    setForm({ source: 'naver', naver_product_id: '', naver_product_name: '', domeggook_url: '', domeggook_option: '' });
  }

  async function handleConfirmDelete(id: number) {
    if (!confirm('이 매핑을 삭제하시겠습니까?')) return;
    deleteMutation.mutate(id);
  }

  return (
    <>
      <div className="btn-group" style={{ marginBottom: '16px' }}>
        <button
          className="btn btn-primary"
          onClick={handleLoadNaver}
          disabled={naverFetching}
        >
          {naverFetching ? '불러오는 중...' : '네이버 상품 불러오기'}
        </button>
      </div>

      {naverLoaded && (
        <>
          <div className="section-title">네이버 판매 상품 → 구매처 연결</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>상품ID</th>
                  <th>상품명</th>
                  <th>가격</th>
                  <th>상태</th>
                  <th>구매처 URL</th>
                  <th>판매처 옵션</th>
                  <th>구매처 옵션</th>
                  <th>연결</th>
                </tr>
              </thead>
              <tbody>
                {naverFetching && (
                  <tr><td colSpan={8} className="loading-overlay">불러오는 중...</td></tr>
                )}
                {!naverFetching && (naverData?.contents ?? []).length === 0 && (
                  <tr><td colSpan={8} className="empty">상품이 없습니다</td></tr>
                )}
                {!naverFetching && (naverData?.contents ?? []).map((p: NaverProduct, i: number) => (
                  <NaverProductRow
                    key={i}
                    product={p}
                    index={i}
                    existingMapping={existingMappingsMap[String(p.originProductNo || p.channelProductNo || '')]}
                    onLink={(productId, productName, url, option) => {
                      createMutation.mutate({
                        source: 'naver',
                        naver_product_id: productId,
                        naver_product_name: productName,
                        domeggook_url: url,
                        domeggook_option: option,
                      });
                    }}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <div className="form-card" style={{ marginTop: '24px' }}>
        <h3>수동 매핑 등록</h3>
        <form onSubmit={handleFormSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>출처 *</label>
              <select
                value={form.source}
                onChange={(e) => handleFormChange('source', e.target.value)}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #dfe6e9', borderRadius: '6px', fontSize: '13px' }}
              >
                <option value="naver">네이버</option>
                <option value="coupang">쿠팡</option>
                <option value="cafe24">카페24</option>
              </select>
            </div>
            <div className="form-group">
              <label>상품 ID *</label>
              <input
                type="text"
                value={form.naver_product_id}
                onChange={(e) => handleFormChange('naver_product_id', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>상품명</label>
              <input
                type="text"
                value={form.naver_product_name}
                onChange={(e) => handleFormChange('naver_product_name', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>구매처 URL *</label>
              <input
                type="text"
                value={form.domeggook_url}
                onChange={(e) => handleFormChange('domeggook_url', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>구매처 옵션</label>
              <input
                type="text"
                value={form.domeggook_option}
                onChange={(e) => handleFormChange('domeggook_option', e.target.value)}
              />
            </div>
          </div>
          <div style={{ marginTop: '12px' }}>
            <button type="submit" className="btn btn-primary" disabled={createMutation.isPending}>
              등록
            </button>
          </div>
        </form>
      </div>

      <div className="section-title" style={{ marginTop: '24px' }}>매핑 목록</div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>출처</th>
              <th>상품 ID</th>
              <th>상품명</th>
              <th>구매처 URL</th>
              <th>구매처 옵션</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {mappingsLoading && (
              <tr><td colSpan={8} className="loading-overlay">불러오는 중...</td></tr>
            )}
            {!mappingsLoading && (mappings ?? []).length === 0 && (
              <tr><td colSpan={8} className="empty">매핑이 없습니다</td></tr>
            )}
            {mappings?.map((m) => (
              <tr key={m.id}>
                <td>{m.id}</td>
                <td>{m.source || 'naver'}</td>
                <td>{m.naver_product_id}</td>
                <td>{m.naver_product_name || '-'}</td>
                <td>{m.domeggook_url}</td>
                <td>{m.domeggook_option}</td>
                <td>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleConfirmDelete(m.id)}
                    disabled={deleteMutation.isPending}
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

interface NaverProductRowProps {
  product: NaverProduct;
  index: number;
  existingMapping?: Mapping;
  onLink: (productId: string, productName: string, url: string, option: string) => void;
}

function NaverProductRow({ product, existingMapping, onLink }: NaverProductRowProps) {
  const pid = String(product.originProductNo || product.channelProductNo || '');
  const name = product.channelProductName || product.name || '';
  const price = product.salePrice || product.channelProductPrice || 0;
  const status = product.statusType || product.channelProductDisplayStatusType || '';

  const [url, setUrl] = useState(existingMapping?.domeggook_url ?? '');
  const [option, setOption] = useState(existingMapping?.domeggook_option ?? '');
  const [fetchedOptions, setFetchedOptions] = useState<DomeggookOption[]>([]);
  const [optionLoading, setOptionLoading] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  const fetchOptions = useCallback(async (productUrl: string) => {
    if (!productUrl.startsWith('http')) return;
    setOptionLoading(true);
    try {
      const data = await getDomeggookOptions(productUrl);
      setFetchedOptions(data.options);
      // 각 옵션 그룹의 첫번째 값을 기본 선택
      const defaults: Record<string, string> = {};
      data.options.forEach((opt) => {
        if (opt.values.length > 0) defaults[opt.name] = opt.values[0];
      });
      setSelectedOptions(defaults);
      setOption(JSON.stringify(defaults));
    } catch {
      setFetchedOptions([]);
    } finally {
      setOptionLoading(false);
    }
  }, []);

  function handleUrlBlur() {
    if (url.trim() && url.startsWith('http') && !existingMapping) {
      fetchOptions(url.trim());
    }
  }

  function handleOptionSelect(optName: string, value: string) {
    const updated = { ...selectedOptions, [optName]: value };
    setSelectedOptions(updated);
    setOption(JSON.stringify(updated));
  }

  function handleLink() {
    if (!url.trim()) return;
    onLink(pid, name, url.trim(), option.trim());
  }

  // 네이버 상품 옵션 표시 텍스트
  const naverOptions = product.options ?? [];

  return (
    <tr>
      <td>{pid}</td>
      <td>{name}</td>
      <td>{price ? Number(price).toLocaleString() + '원' : '-'}</td>
      <td>
        <span className={`badge ${status === 'SALE' ? 'badge-shipped' : 'badge-new'}`}>
          {status}
        </span>
      </td>
      <td>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onBlur={handleUrlBlur}
          placeholder="구매처 URL 입력"
          style={{ width: '200px', padding: '4px 8px', border: '1px solid #dfe6e9', borderRadius: '4px', fontSize: '12px' }}
        />
      </td>
      <td>
        {naverOptions.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '11px', maxHeight: '80px', overflowY: 'auto' }}>
            {naverOptions.map((opt, i) => {
              const parts = [opt.optionName1, opt.optionName2, opt.optionName3].filter(Boolean);
              return (
                <span key={i} style={{ color: opt.usable === false ? '#b2bec3' : '#2d3436' }}>
                  {parts.join(' / ')}{opt.stockQuantity != null ? ` (${opt.stockQuantity})` : ''}
                </span>
              );
            })}
          </div>
        ) : (
          <span style={{ fontSize: '11px', color: '#b2bec3' }}>옵션 없음</span>
        )}
      </td>
      <td>
        {optionLoading ? (
          <span style={{ fontSize: '11px', color: '#636e72' }}>옵션 조회 중...</span>
        ) : fetchedOptions.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {fetchedOptions.map((opt) => (
              <select
                key={opt.name}
                value={selectedOptions[opt.name] ?? ''}
                onChange={(e) => handleOptionSelect(opt.name, e.target.value)}
                style={{ padding: '3px 6px', border: '1px solid #dfe6e9', borderRadius: '4px', fontSize: '11px' }}
                title={opt.name}
              >
                {opt.values.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            ))}
          </div>
        ) : (
          <input
            type="text"
            value={option}
            onChange={(e) => setOption(e.target.value)}
            placeholder="URL 입력 시 자동 조회"
            style={{ width: '140px', padding: '4px 8px', border: '1px solid #dfe6e9', borderRadius: '4px', fontSize: '12px' }}
          />
        )}
      </td>
      <td>
        {existingMapping ? (
          <span className="badge badge-shipped">연결됨</span>
        ) : (
          <button
            className="btn btn-primary"
            style={{ padding: '4px 10px', fontSize: '12px' }}
            onClick={handleLink}
            disabled={optionLoading}
          >
            연결
          </button>
        )}
      </td>
    </tr>
  );
}
