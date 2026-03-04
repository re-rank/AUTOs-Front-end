import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getConnectors,
  updateConnector,
  getSuppliers,
  updateSupplier,
  getServerIp,
} from '../api/connectors';
import type { ConnectorSetting } from '../types';
import { useToast } from '../components/Toast';
import { useNavigate } from 'react-router-dom';

const CONNECTOR_FIELDS: Record<string, [string, string][]> = {
  naver: [['client_id', '클라이언트 ID'], ['client_secret', '클라이언트 시크릿']],
  coupang: [['access_key', '액세스 키'], ['secret_key', '시크릿 키'], ['vendor_id', '벤더 ID']],
  cafe24: [['mall_id', '몰 ID'], ['client_id', '클라이언트 ID'], ['client_secret', '클라이언트 시크릿']],
};

const CONNECTOR_LABELS: Record<string, string> = {
  naver: '네이버',
  coupang: '쿠팡',
  cafe24: '카페24',
};

const SUPPLIER_FIELDS: Record<string, [string, string][]> = {
  domeggook: [['user_id', '아이디'], ['user_pw', '비밀번호']],
};

const SUPPLIER_LABELS: Record<string, string> = {
  domeggook: '도매매',
};

export default function SettingsPage() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: connectors } = useQuery({ queryKey: ['connectors'], queryFn: getConnectors });
  const { data: suppliers } = useQuery({ queryKey: ['suppliers'], queryFn: getSuppliers });
  const { data: serverIp } = useQuery({ queryKey: ['server-ip'], queryFn: getServerIp });

  const connectorMutation = useMutation({
    mutationFn: ({ name, data }: { name: string; data: { enabled: boolean; config: Record<string, string> } }) =>
      updateConnector(name, data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['connectors'] });
      showToast(`${CONNECTOR_LABELS[vars.name] || vars.name} 설정이 저장되었습니다. 상품 목록을 불러옵니다...`);
      navigate('/mappings');
    },
    onError: (err: Error) => showToast('저장 실패: ' + err.message, 'error'),
  });

  const supplierMutation = useMutation({
    mutationFn: ({ name, data }: { name: string; data: { enabled: boolean; config: Record<string, string> } }) =>
      updateSupplier(name, data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      showToast(`${SUPPLIER_LABELS[vars.name] || vars.name} 설정이 저장되었습니다`);
    },
    onError: (err: Error) => showToast('저장 실패: ' + err.message, 'error'),
  });

  return (
    <>
      <div
        className="form-card"
        style={{ background: '#fff3cd', border: '1px solid #ffc107', marginBottom: '20px' }}
      >
        <h3 style={{ color: '#856404' }}>네이버 API IP 등록 안내</h3>
        <p style={{ fontSize: '13px', color: '#856404', marginTop: '8px', lineHeight: '1.6' }}>
          네이버 커머스 API를 사용하려면 서버 IP를 허용 목록에 등록해야 합니다.<br />
          <strong>서버 IP: {serverIp?.ip ?? '확인 중...'}</strong><br />
          <a
            href="https://apicenter.commerce.naver.com"
            target="_blank"
            rel="noreferrer"
            style={{ color: '#0984e3' }}
          >
            네이버 커머스 API 센터
          </a>{' '}
          → 애플리케이션 관리 → 허용 IP에 위 IP를 추가하세요.
        </p>
      </div>

      <div className="section-title">판매처 (커넥터)</div>
      <div className="connector-cards">
        {connectors?.map((c) => (
          <ConnectorCard
            key={c.name}
            connector={c}
            fields={CONNECTOR_FIELDS[c.name] ?? []}
            label={CONNECTOR_LABELS[c.name] ?? c.name}
            onSave={(enabled, config) =>
              connectorMutation.mutate({ name: c.name, data: { enabled, config } })
            }
            isPending={connectorMutation.isPending}
            fieldType="text"
          />
        ))}
      </div>

      <div className="section-title" style={{ marginTop: '24px' }}>구매처</div>
      <div className="connector-cards">
        {suppliers?.map((s) => (
          <ConnectorCard
            key={s.name}
            connector={s}
            fields={SUPPLIER_FIELDS[s.name] ?? []}
            label={SUPPLIER_LABELS[s.name] ?? s.name}
            onSave={(enabled, config) =>
              supplierMutation.mutate({ name: s.name, data: { enabled, config } })
            }
            isPending={supplierMutation.isPending}
            fieldType="mixed"
          />
        ))}
      </div>
    </>
  );
}

interface ConnectorCardProps {
  connector: ConnectorSetting;
  fields: [string, string][];
  label: string;
  onSave: (enabled: boolean, config: Record<string, string>) => void;
  isPending: boolean;
  fieldType: 'text' | 'mixed';
}

function ConnectorCard({ connector, fields, label, onSave, isPending, fieldType }: ConnectorCardProps) {
  const [enabled, setEnabled] = useState(connector.enabled);
  const [config, setConfig] = useState<Record<string, string>>(
    Object.fromEntries(fields.map(([key]) => [key, connector.config[key] ?? '']))
  );

  function setField(key: string, value: string) {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }

  function isPasswordField(key: string): boolean {
    return fieldType === 'mixed' && key.includes('pw');
  }

  return (
    <div className="connector-card">
      <div className="cc-header">
        <h3>{label}</h3>
        <label className="toggle">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
          />
          <span className="slider" />
        </label>
      </div>
      <div className="cc-fields">
        {fields.map(([key, fieldLabel]) => (
          <div key={key} className="form-group">
            <label>{fieldLabel}</label>
            <input
              type={isPasswordField(key) ? 'password' : 'text'}
              value={config[key] ?? ''}
              onChange={(e) => setField(key, e.target.value)}
              placeholder={fieldLabel}
            />
          </div>
        ))}
      </div>
      <div className="cc-actions">
        <button
          className="btn btn-primary"
          onClick={() => onSave(enabled, config)}
          disabled={isPending}
        >
          저장
        </button>
      </div>
    </div>
  );
}
