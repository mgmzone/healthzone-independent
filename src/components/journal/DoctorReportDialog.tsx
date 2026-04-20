import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Stethoscope, Loader2, Copy, Check, Printer, AlertCircle } from 'lucide-react';
import { toLocalDateString } from '@/lib/utils/dateUtils';
import { generateDoctorReport, DoctorReport } from '@/lib/services/aiService';
import { toast } from 'sonner';

// Pre-visit medical summary generator. User picks a date range + optional
// tag filter + optional focus text, we ask Claude to build a one-page
// summary of journal entries, weight trend, compliance, and symptoms.
// Output is markdown; we render a minimal viewer with Copy and Print buttons.

interface DoctorReportDialogProps {
  availableTags: string[];
  triggerClassName?: string;
}

const DEFAULT_LOOKBACK_DAYS = 30;

function defaultFromDate(): string {
  const d = new Date();
  d.setDate(d.getDate() - DEFAULT_LOOKBACK_DAYS);
  return toLocalDateString(d);
}

// Minimal markdown renderer — just enough for headings, lists, and bold.
// Avoids pulling in react-markdown for one use-site. If rendering grows,
// migrate to a real lib.
function renderMarkdown(md: string): React.ReactNode {
  const lines = md.split('\n');
  const out: React.ReactNode[] = [];
  let listBuffer: string[] = [];

  const flushList = () => {
    if (listBuffer.length === 0) return;
    out.push(
      <ul key={`ul-${out.length}`} className="list-disc pl-6 my-2 space-y-1">
        {listBuffer.map((item, i) => (
          <li key={i} dangerouslySetInnerHTML={{ __html: inline(item) }} />
        ))}
      </ul>
    );
    listBuffer = [];
  };

  const inline = (s: string) =>
    s
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>');

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line.startsWith('# ')) {
      flushList();
      out.push(
        <h1 key={out.length} className="text-2xl font-bold mt-2 mb-3">
          {line.slice(2)}
        </h1>
      );
    } else if (line.startsWith('## ')) {
      flushList();
      out.push(
        <h2 key={out.length} className="text-lg font-semibold mt-4 mb-2">
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith('### ')) {
      flushList();
      out.push(
        <h3 key={out.length} className="text-base font-semibold mt-3 mb-1">
          {line.slice(4)}
        </h3>
      );
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      listBuffer.push(line.slice(2));
    } else if (line.trim() === '') {
      flushList();
    } else {
      flushList();
      out.push(
        <p
          key={out.length}
          className="my-2 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: inline(line) }}
        />
      );
    }
  }
  flushList();
  return out;
}

const DoctorReportDialog: React.FC<DoctorReportDialogProps> = ({
  availableTags,
  triggerClassName,
}) => {
  const [open, setOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState(defaultFromDate());
  const [dateTo, setDateTo] = useState(toLocalDateString(new Date()));
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [focus, setFocus] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<DoctorReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setReport(null);
    try {
      const result = await generateDoctorReport({
        dateFrom,
        dateTo,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        focus: focus.trim() || undefined,
      });
      setReport(result);
    } catch (err: any) {
      setError(err.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!report) return;
    try {
      await navigator.clipboard.writeText(report.report);
      setCopied(true);
      toast.success('Report copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Clipboard access denied — select the text manually');
    }
  };

  const handlePrint = () => {
    // Open a dedicated print window so we don't print the whole app chrome.
    if (!report) return;
    const w = window.open('', '_blank', 'width=800,height=900');
    if (!w) {
      toast.error('Pop-up blocked — allow pop-ups to print');
      return;
    }
    w.document.write(`<!doctype html>
<html><head><title>Pre-visit report</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif; max-width: 720px; margin: 40px auto; padding: 0 24px; color: #0f172a; line-height: 1.55; }
  h1 { font-size: 22px; margin: 0 0 16px; }
  h2 { font-size: 16px; margin: 24px 0 8px; color: #334155; }
  ul { padding-left: 22px; }
  li { margin: 4px 0; }
  p { margin: 8px 0; }
  .meta { font-size: 12px; color: #64748b; margin-bottom: 16px; }
</style>
</head><body>
<div class="meta">Generated ${new Date().toLocaleString()} &mdash; window ${report.dateFrom} to ${report.dateTo} &mdash; ${report.entryCount} journal entries</div>
${report.report
  .replace(/\n\n/g, '</p><p>')
  .replace(/^# (.+)$/gm, '<h1>$1</h1>')
  .replace(/^## (.+)$/gm, '<h2>$1</h2>')
  .replace(/^- (.+)$/gm, '<li>$1</li>')
  .replace(/(<li>.*<\/li>\s*)+/g, '<ul>$&</ul>')
  .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}
<script>window.print();</script>
</body></html>`);
    w.document.close();
  };

  const reset = () => {
    setReport(null);
    setError(null);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" className={triggerClassName}>
          <Stethoscope className="h-4 w-4 mr-2" />
          Doctor report
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate pre-visit summary</DialogTitle>
          <DialogDescription>
            A one-page report you can copy into a patient portal or print for your doctor.
            Pulls from your journal, weight, and compliance data.
          </DialogDescription>
        </DialogHeader>

        {!report && (
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="report-from">From</Label>
                <Input
                  id="report-from"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="report-to">To</Label>
                <Input
                  id="report-to"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {availableTags.length > 0 && (
              <div>
                <Label>Filter journal by tags (optional)</Label>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {availableTags.map((tag) => {
                    const active = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        disabled={loading}
                        className={`rounded-full px-2.5 py-0.5 text-xs border transition-colors disabled:opacity-50 ${
                          active
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        #{tag}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Leave blank to include every journal entry in the window.
                </p>
              </div>
            )}

            <div>
              <Label htmlFor="report-focus">
                What do you want to emphasize? (optional)
              </Label>
              <Textarea
                id="report-focus"
                value={focus}
                onChange={(e) => setFocus(e.target.value)}
                placeholder="e.g. Side effects of medication changes, pain trend since surgery, irritant-food triggers…"
                className="min-h-[80px]"
                disabled={loading}
                maxLength={300}
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
                <AlertCircle className="h-4 w-4 text-amber-700 dark:text-amber-400 mt-0.5 shrink-0" />
                <p className="text-sm text-amber-800 dark:text-amber-300">{error}</p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleGenerate} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating
                  </>
                ) : (
                  'Generate report'
                )}
              </Button>
            </div>
          </div>
        )}

        {report && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3 pb-2 border-b">
              <div className="text-xs text-muted-foreground">
                Window {report.dateFrom} to {report.dateTo} &middot;{' '}
                {report.entryCount} journal {report.entryCount === 1 ? 'entry' : 'entries'}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleCopy}>
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-1.5" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1.5" />
                      Copy
                    </>
                  )}
                </Button>
                <Button size="sm" variant="outline" onClick={handlePrint}>
                  <Printer className="h-4 w-4 mr-1.5" />
                  Print
                </Button>
              </div>
            </div>

            <div className="prose prose-sm max-w-none dark:prose-invert text-foreground">
              {renderMarkdown(report.report)}
            </div>

            <div className="flex justify-between pt-3 border-t">
              <Button variant="ghost" size="sm" onClick={reset}>
                &larr; Generate another
              </Button>
              <Button size="sm" onClick={() => setOpen(false)}>
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DoctorReportDialog;
