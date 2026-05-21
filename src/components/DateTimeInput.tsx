import React, { useState, useEffect, useRef } from 'react';

type Segment = 'day' | 'month' | 'year' | 'hour' | 'minute' | 'ampm';

const SEGMENT_ORDER: Segment[] =
  ['day', 'month', 'year', 'hour', 'minute', 'ampm'];

const SEGMENT_RANGES: Record<Segment, [number, number]> = {
  day: [0, 2], month: [3, 5], year: [6, 10],
  hour: [11, 13], minute: [14, 16], ampm: [17, 21],
};

const SEGMENT_MAX: Record<Segment, number> = {
  day: 2, month: 2, year: 4, hour: 2, minute: 2, ampm: 1
};

interface SegmentValues {
  day: string; month: string; year: string;
  hour: string; minute: string; ampm: 'a' | 'p' | '';
}

interface DateTimeInputProps {
  value: string;
  onChange: (iso: string) => void;
  disabled?: boolean;
  className?: string;
}

export const DateTimeInput: React.FC<DateTimeInputProps> = ({
  value, onChange, disabled, className
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeSegment, setActiveSegment] = useState<Segment | null>(null);
  const [buffer, setBuffer] = useState('');
  const [vals, setVals] = useState<SegmentValues>({
    day:'', month:'', year:'', hour:'', minute:'', ampm:''
  });

  const isoToVals = (iso: string): SegmentValues => {
    if (!iso) return { day:'', month:'', year:'', hour:'', minute:'', ampm:'' };
    try {
      const d = new Date(iso);
      const h = d.getHours();
      const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
      return {
        day:   String(d.getDate()).padStart(2,'0'),
        month: String(d.getMonth()+1).padStart(2,'0'),
        year:  String(d.getFullYear()),
        hour:  String(h12).padStart(2,'0'),
        minute: String(d.getMinutes()).padStart(2,'0'),
        ampm:  h < 12 ? 'a' : 'p'
      };
    } catch { return { day:'', month:'', year:'', hour:'', minute:'', ampm:'' }; }
  };

  useEffect(() => { setVals(isoToVals(value)); }, [value]);

  const buildDisplay = (v: SegmentValues, seg: Segment | null, buf: string): string => {
    const get = (field: keyof SegmentValues, len: number, def: string): string => {
      if (field === seg && buf) return buf.padEnd(len, '-').slice(0, len);
      const val = v[field] as string;
      return val ? val.padStart(len, '0') : def;
    };
    const d   = get('day', 2, '--');
    const m   = get('month', 2, '--');
    const y   = get('year', 4, '----');
    const h   = get('hour', 2, '--');
    const min = get('minute', 2, '--');
    const ap  = seg === 'ampm' ? '-.-.'
      : v.ampm === 'a' ? 'a.m.' : v.ampm === 'p' ? 'p.m.' : '-.-.';
    return `${d}/${m}/${y} ${h}:${min} ${ap}`;
  };

  useEffect(() => {
    if (activeSegment && inputRef.current) {
      const [s, e] = SEGMENT_RANGES[activeSegment];
      setTimeout(() => inputRef.current?.setSelectionRange(s, e), 0);
    }
  }, [activeSegment, buffer, vals]);

  const emitISO = (v: SegmentValues) => {
    if (!v.day||!v.month||!v.year||!v.hour||!v.minute||!v.ampm) return;
    let h = parseInt(v.hour);
    if (v.ampm === 'p' && h !== 12) h += 12;
    if (v.ampm === 'a' && h === 12) h = 0;
    const d = new Date(parseInt(v.year), parseInt(v.month)-1,
      parseInt(v.day), h, parseInt(v.minute), 0);
    if (!isNaN(d.getTime())) onChange(d.toISOString());
  };

  const goTo = (seg: Segment) => { setActiveSegment(seg); setBuffer(''); };
  const next = (seg: Segment) => {
    const i = SEGMENT_ORDER.indexOf(seg);
    if (i < SEGMENT_ORDER.length-1) goTo(SEGMENT_ORDER[i+1]);
    else { setActiveSegment(null); setBuffer(''); }
  };
  const prev = (seg: Segment) => {
    const i = SEGMENT_ORDER.indexOf(seg);
    if (i > 0) goTo(SEGMENT_ORDER[i-1]);
  };

  const handleClick = () => {
    if (!inputRef.current) return;
    const pos = inputRef.current.selectionStart || 0;
    if (pos <= 2) goTo('day');
    else if (pos <= 5) goTo('month');
    else if (pos <= 10) goTo('year');
    else if (pos <= 13) goTo('hour');
    else if (pos <= 16) goTo('minute');
    else goTo('ampm');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    e.preventDefault();
    const seg = activeSegment || 'day';
    if (!activeSegment) goTo('day');
    const key = e.key.toLowerCase();

    if (e.key === 'Tab') {
      e.shiftKey ? prev(seg) : next(seg);
      return;
    }
    if (e.key === 'ArrowRight') { next(seg); return; }
    if (e.key === 'ArrowLeft')  { prev(seg); return; }

    if (e.key === 'Backspace' || e.key === 'Delete') {
      if (buffer.length > 0) {
        setBuffer(b => b.slice(0,-1));
      } else {
        const nv = { ...vals, [seg]: '' };
        setVals(nv);
        prev(seg);
      }
      return;
    }

    if (seg === 'ampm') {
      if (key === 'a' || key === 'p') {
        const nv = { ...vals, ampm: key as 'a'|'p' };
        setVals(nv);
        setActiveSegment(null);
        setBuffer('');
        emitISO(nv);
      }
      return;
    }

    if (key >= '0' && key <= '9') {
      const nb = buffer + key;
      const maxLen = SEGMENT_MAX[seg];
      if (nb.length < maxLen) {
        setBuffer(nb);
      } else {
        const nv = { ...vals, [seg]: nb };
        setVals(nv);
        setBuffer('');
        next(seg);
        emitISO(nv);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').trim();
    const m = text.match(
      /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})\s+(a\.m\.|p\.m\.)$/
    );
    if (m) {
      const [,dd,mm,yyyy,hh,min,ap] = m;
      const nv: SegmentValues = {
        day:dd, month:mm, year:yyyy, hour:hh, minute:min,
        ampm: ap.startsWith('a') ? 'a' : 'p'
      };
      setVals(nv); setBuffer(''); setActiveSegment(null);
      emitISO(nv);
    }
  };

  return (
    <input
      ref={inputRef}
      type="text"
      value={buildDisplay(vals, activeSegment, buffer)}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
      onFocus={() => { if (!activeSegment) goTo('day'); }}
      onBlur={() => { setActiveSegment(null); setBuffer(''); }}
      onPaste={handlePaste}
      onChange={() => {}}
      disabled={disabled}
      className={className ||
        'w-full border border-gray-200 rounded-xl text-sm ' +
        'focus:ring-2 focus:ring-blue-500 px-4 py-2.5 font-mono ' +
        'transition-all cursor-text select-none'}
    />
  );
};
