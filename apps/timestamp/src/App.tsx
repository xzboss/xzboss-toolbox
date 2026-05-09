import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ClipboardCopy, Trash2 } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  Input,
  Tabs,
  Textarea,
} from '@xzboss/ui';
import {
  convertSingleTimestamp,
  scanJsonText,
  scanTextTimestamps,
} from '@xzboss/utils';

const TAB_SINGLE = 'single';
const TAB_JSON = 'json';
const TAB_TEXT = 'text';

const tabs = [
  { id: TAB_SINGLE, label: '单个' },
  { id: TAB_JSON, label: 'JSON' },
  { id: TAB_TEXT, label: '文本' },
];

function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

async function copyText(text: string) {
  await navigator.clipboard.writeText(text);
}

const EXAMPLE_SINGLE = '1715241600';
const EXAMPLE_JSON = JSON.stringify(
  {
    user: { id: 1, createdAt: 1715241600000 },
    items: ['1735660800', 1735660800000],
  },
  null,
  2,
);
const EXAMPLE_TEXT = 'start 1715241600 end\nline 1735660800123 and 1715241600';

export function App() {
  const portalUrl = import.meta.env.VITE_PORTAL_URL ?? 'http://localhost:5173';

  const [tab, setTab] = useState(TAB_SINGLE);
  const [single, setSingle] = useState('');
  const [jsonText, setJsonText] = useState('');
  const [textBlob, setTextBlob] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const debouncedJson = useDebounced(jsonText, 280);
  const debouncedText = useDebounced(textBlob, 280);

  const singleResult = useMemo(() => convertSingleTimestamp(single), [single]);

  const jsonResult = useMemo(() => {
    if (!debouncedJson.trim()) {
      return null;
    }
    return scanJsonText(debouncedJson);
  }, [debouncedJson]);

  const textHits = useMemo(() => {
    if (!debouncedText.trim()) {
      return [];
    }
    return scanTextTimestamps(debouncedText);
  }, [debouncedText]);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  }

  async function handleCopy(text: string) {
    try {
      await copyText(text);
      showToast('已复制到剪贴板');
    } catch {
      showToast('复制失败，请检查浏览器权限');
    }
  }

  function fillExample() {
    if (tab === TAB_SINGLE) {
      setSingle(EXAMPLE_SINGLE);
    } else if (tab === TAB_JSON) {
      setJsonText(EXAMPLE_JSON);
    } else {
      setTextBlob(EXAMPLE_TEXT);
    }
  }

  function clearInput() {
    if (tab === TAB_SINGLE) {
      setSingle('');
    } else if (tab === TAB_JSON) {
      setJsonText('');
    } else {
      setTextBlob('');
    }
  }

  const copyPayload = useMemo(() => {
    if (tab === TAB_SINGLE) {
      if (!singleResult.formatted) {
        return '';
      }
      return [
        `raw: ${singleResult.raw}`,
        `unit: ${singleResult.unit}`,
        `local: ${singleResult.formatted.local}`,
        `iso: ${singleResult.formatted.iso}`,
        `utc: ${singleResult.formatted.utc}`,
      ].join('\n');
    }
    if (tab === TAB_JSON && jsonResult?.ok) {
      return jsonResult.hits
        .map(
          (h) =>
            `${h.path}\t${String(h.raw)}\t${h.unit}\t${h.formatted.iso}\t${h.formatted.local}`,
        )
        .join('\n');
    }
    if (tab === TAB_TEXT) {
      return textHits
        .map(
          (h) =>
            `${h.value}\t${h.unit}\tx${h.count}\t${h.formatted.iso}\t${h.formatted.local}`,
        )
        .join('\n');
    }
    return '';
  }, [tab, singleResult, jsonResult, textHits]);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-200/60 via-zinc-50 to-zinc-50">
      <header className="border-b border-zinc-200/80 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-3">
          <div className="flex items-center gap-3">
            <a
              href={portalUrl}
              className="inline-flex items-center gap-1 text-sm font-medium text-zinc-600 hover:text-zinc-900"
            >
              <ArrowLeft className="size-4" aria-hidden />
              工具箱
            </a>
            <span className="text-zinc-300">/</span>
            <h1 className="text-sm font-semibold text-zinc-900">时间戳工具</h1>
          </div>
          <Badge>本地计算</Badge>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-6 py-8 lg:grid-cols-2 lg:items-start">
        <Card className="shadow-sm">
          <CardHeader
            title="输入"
            description="在左侧选择模式并粘贴内容，右侧会实时生成结果。"
          />
          <CardContent className="space-y-4">
            <Tabs items={tabs} value={tab} onChange={setTab} />
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" onClick={fillExample}>
                填入示例
              </Button>
              <Button type="button" variant="ghost" onClick={clearInput}>
                <Trash2 className="mr-1 size-3.5" aria-hidden />
                清空
              </Button>
            </div>

            {tab === TAB_SINGLE ? (
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-600" htmlFor="ts-single">
                  时间戳
                </label>
                <Input
                  id="ts-single"
                  inputMode="numeric"
                  placeholder="10 位秒或 13 位毫秒"
                  value={single}
                  onChange={(e) => setSingle(e.target.value)}
                />
              </div>
            ) : null}

            {tab === TAB_JSON ? (
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-600" htmlFor="ts-json">
                  JSON 文本
                </label>
                <Textarea
                  id="ts-json"
                  placeholder="{ ... }"
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  spellCheck={false}
                />
              </div>
            ) : null}

            {tab === TAB_TEXT ? (
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-600" htmlFor="ts-text">
                  任意文本
                </label>
                <Textarea
                  id="ts-text"
                  placeholder="日志、SQL、响应片段等"
                  value={textBlob}
                  onChange={(e) => setTextBlob(e.target.value)}
                  spellCheck={false}
                />
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader title="结果" description="支持一键复制汇总后的表格文本。" />
          <CardContent className="space-y-4">
            {tab === TAB_SINGLE ? (
              <div className="space-y-3">
                {!single.trim() ? (
                  <p className="text-sm text-zinc-500">输入一个时间戳以查看解析结果。</p>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-2">
                      {singleResult.unit ? (
                        <Badge>
                          {singleResult.unit === 'seconds' ? '秒级' : '毫秒级'}
                        </Badge>
                      ) : (
                        <Badge className="border-amber-200 bg-amber-50 text-amber-900">
                          无法识别单位
                        </Badge>
                      )}
                      <Badge
                        className={
                          singleResult.valid
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                            : 'border-rose-200 bg-rose-50 text-rose-900'
                        }
                      >
                        {singleResult.valid ? '合法' : '非法或越界'}
                      </Badge>
                    </div>
                    <dl className="grid gap-2 text-sm">
                      <div className="flex justify-between gap-4 border-b border-zinc-100 py-1">
                        <dt className="text-zinc-500">原始输入</dt>
                        <dd className="text-right font-mono text-zinc-900">{singleResult.raw}</dd>
                      </div>
                      {singleResult.formatted ? (
                        <>
                          <div className="flex justify-between gap-4 border-b border-zinc-100 py-1">
                            <dt className="text-zinc-500">本地</dt>
                            <dd className="text-right text-zinc-900">
                              {singleResult.formatted.local}
                            </dd>
                          </div>
                          <div className="flex justify-between gap-4 border-b border-zinc-100 py-1">
                            <dt className="text-zinc-500">ISO</dt>
                            <dd className="break-all text-right font-mono text-xs text-zinc-900">
                              {singleResult.formatted.iso}
                            </dd>
                          </div>
                          <div className="flex justify-between gap-4 py-1">
                            <dt className="text-zinc-500">UTC</dt>
                            <dd className="text-right text-zinc-900">
                              {singleResult.formatted.utc}
                            </dd>
                          </div>
                        </>
                      ) : null}
                    </dl>
                  </>
                )}
              </div>
            ) : null}

            {tab === TAB_JSON ? (
              <div className="space-y-3">
                {!jsonText.trim() ? (
                  <p className="text-sm text-zinc-500">粘贴 JSON 后会自动递归扫描时间戳。</p>
                ) : jsonResult && !jsonResult.ok ? (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
                    <p className="font-medium">JSON 解析失败</p>
                    <p className="mt-1 font-mono text-xs">{jsonResult.error}</p>
                    <p className="mt-2 text-xs text-amber-900">
                      你可以改到「文本」模式，按纯文本规则扫描数字。
                    </p>
                  </div>
                ) : jsonResult && jsonResult.ok && jsonResult.hits.length === 0 ? (
                  <p className="text-sm text-zinc-500">未发现符合条件的 10 / 13 位时间戳。</p>
                ) : jsonResult && jsonResult.ok ? (
                  <>
                    <p className="text-xs text-zinc-500">
                      共 {jsonResult.hits.length} 条命中（保留 JSON 中的路径）。
                    </p>
                    <div className="max-h-[420px] overflow-auto rounded-lg border border-zinc-100">
                      <table className="min-w-full text-left text-xs">
                        <thead className="sticky top-0 bg-zinc-50">
                          <tr className="border-b border-zinc-200">
                            <th className="px-3 py-2 font-medium text-zinc-600">路径</th>
                            <th className="px-3 py-2 font-medium text-zinc-600">原始值</th>
                            <th className="px-3 py-2 font-medium text-zinc-600">单位</th>
                            <th className="px-3 py-2 font-medium text-zinc-600">本地时间</th>
                            <th className="px-3 py-2 font-medium text-zinc-600">ISO</th>
                          </tr>
                        </thead>
                        <tbody>
                          {jsonResult.hits.map((h, i) => (
                            <tr key={`${i}-${h.path}-${String(h.raw)}`} className="border-b border-zinc-100">
                              <td className="px-3 py-2 font-mono text-zinc-800">{h.path}</td>
                              <td className="px-3 py-2 font-mono text-zinc-800">
                                {String(h.raw)}
                              </td>
                              <td className="px-3 py-2">
                                <Badge className="text-[10px]">
                                  {h.unit === 'seconds' ? '秒' : '毫秒'}
                                </Badge>
                              </td>
                              <td className="px-3 py-2 text-zinc-800">{h.formatted.local}</td>
                              <td className="px-3 py-2 font-mono text-[10px] text-zinc-700">
                                {h.formatted.iso}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : null}
              </div>
            ) : null}

            {tab === TAB_TEXT ? (
              <div className="space-y-3">
                {!textBlob.trim() ? (
                  <p className="text-sm text-zinc-500">粘贴任意文本，扫描独立的 10 / 13 位数字。</p>
                ) : textHits.length === 0 ? (
                  <p className="text-sm text-zinc-500">未发现符合边界规则的时间戳。</p>
                ) : (
                  <>
                    <p className="text-xs text-zinc-500">
                      去重 {textHits.length} 条，总出现{' '}
                      {textHits.reduce((n, h) => n + h.count, 0)} 次。
                    </p>
                    <ul className="max-h-[420px] space-y-2 overflow-auto pr-1">
                      {textHits.map((h) => (
                        <li
                          key={h.value}
                          className="rounded-lg border border-zinc-100 bg-zinc-50/80 px-3 py-2"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-sm font-medium text-zinc-900">
                              {h.value}
                            </span>
                            <Badge className="text-[10px]">
                              {h.unit === 'seconds' ? '秒' : '毫秒'}
                            </Badge>
                            <span className="text-xs text-zinc-500">出现 {h.count} 次</span>
                          </div>
                          <p className="mt-1 text-xs text-zinc-700">{h.formatted.local}</p>
                          <p className="font-mono text-[10px] text-zinc-500">{h.formatted.iso}</p>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2 border-t border-zinc-100 pt-4">
              <Button
                type="button"
                variant="secondary"
                disabled={!copyPayload.trim()}
                onClick={() => handleCopy(copyPayload)}
              >
                <ClipboardCopy className="mr-1 size-3.5" aria-hidden />
                复制结果
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      {toast ? (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
