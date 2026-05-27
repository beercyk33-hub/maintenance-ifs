// Main app shell, header, sidebar, and route mounting.
const { useState: _us, useEffect: _ue, useMemo: _um, useRef: _ur } = React;

function useStickyState(key, initial) {
  const [v, setV] = React.useState(() => {
    try {
      const r = localStorage.getItem(key);
      return r ? JSON.parse(r) : initial;
    } catch { return initial; }
  });
  React.useEffect(() => { localStorage.setItem(key, JSON.stringify(v)); }, [key, v]);
  return [v, setV];
}

// Global DB context
const DBContext = React.createContext(null);
const useDB = () => React.useContext(DBContext);

const NAV = [
  { key: 'dashboard',    label: 'Dashboard',          icon: 'dashboard' },
  { key: 'machines',     label: 'รายการเครื่องจักร', icon: 'machine'   },
  { key: 'repair-new',   label: 'แจ้งซ่อมใหม่',       icon: 'wrench'    },
  { key: 'repair-track', label: 'ติดตามงานซ่อม',     icon: 'bell'      },
  { key: 'repair-rec',   label: 'บันทึกการซ่อม',     icon: 'edit'      },
  { key: 'pm',           label: 'บำรุงรักษา (PM)',   icon: 'calendar'  },
  { key: 'history',      label: 'ประวัติเครื่องจักร', icon: 'history'   },
  { key: 'reports',      label: 'รายงาน & สถิติ',     icon: 'chart'     },
  { key: 'admin',        label: 'ส่วนผู้ดูแลระบบ',    icon: 'shield'    },
];

const Header = ({ db, conn, onTest, onLoad, onNav, onMenu }) => (
  <div className="glass rounded-3xl px-5 py-4 fade-in">
    <div className="flex items-center gap-3 flex-wrap">
      <button className="btn btn-ghost btn-sm lg:hidden" onClick={onMenu} aria-label="เมนู">
        <Icon name="menu" size={18} />
      </button>
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="rounded-2xl flex items-center justify-center"
             style={{
               width: 52, height: 52, flex: 'none',
               background: 'linear-gradient(135deg, rgba(56,224,255,0.25), rgba(108,140,255,0.25))',
               border: '1px solid rgba(56,224,255,0.35)',
               boxShadow: '0 10px 30px -10px rgba(56,224,255,0.5)'
             }}>
          <Icon name="bolt" size={26} className="text-cyan-200" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <div style={{
              fontSize: 'clamp(1.4rem,2vw,1.85rem)', fontWeight: 800,
              background: 'linear-gradient(90deg, #ffffff 30%, #8ad6ff 100%)',
              WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
              letterSpacing: '-0.01em', lineHeight: 1,
            }}>{db.settings.systemName}</div>
            <ConnDot conn={conn} />
          </div>
          <div className="mt-1.5 flex items-center gap-x-4 gap-y-1 flex-wrap" style={{ fontSize: '0.82rem', color: 'var(--ink-dim)' }}>
            <span className="flex items-center gap-1.5"><Icon name="location" size={13} />{db.settings.company}</span>
            <span className="flex items-center gap-1.5"><Icon name="machine" size={13} />{db.settings.department}</span>
            <span className="flex items-center gap-1.5"><Icon name="user" size={13} />{db.settings.owner}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <button className="btn btn-ghost btn-sm" onClick={onTest} title="ทดสอบการเชื่อมต่อ">
          <Icon name="link" size={15} /> ทดสอบเชื่อมต่อ
        </button>
        <button className="btn btn-ghost btn-sm" onClick={onLoad} title="โหลดข้อมูล Google Sheet">
          <Icon name="download" size={15} /> โหลดข้อมูล
        </button>
        <button className="btn btn-sm btn-primary" onClick={() => onNav('repair-new')}>
          <Icon name="plus" size={15} /> แจ้งซ่อมใหม่
        </button>
        <button className="btn btn-sm" onClick={() => onNav('pm')}>
          <Icon name="calendar" size={15} /> บันทึก PM
        </button>
        <button className="btn btn-sm" onClick={() => onNav('reports')}>
          <Icon name="chart" size={15} /> ดูรายงาน
        </button>
      </div>
    </div>
  </div>
);

const ConnDot = ({ conn }) => {
  const label = { online: 'Google Sheet: ออนไลน์', offline: 'ออฟไลน์ (ใช้ข้อมูลในเครื่อง)', loading: 'กำลังเชื่อมต่อ...' }[conn] || 'ไม่ทราบ';
  const cls   = { online: 'dot-good', offline: 'dot-bad', loading: 'dot-warn' }[conn] || 'dot-warn';
  return (
    <span className="tag" style={{ background: 'rgba(255,255,255,0.05)' }}>
      <span className={'dot ' + cls} />
      <span style={{ fontSize: '0.74rem' }}>{label}</span>
    </span>
  );
};

const Sidebar = ({ route, onNav, mobileOpen, onCloseMobile }) => (
  <>
    {mobileOpen && (
      <div className="lg:hidden fixed inset-0 z-[70]" style={{ background: 'rgba(2,4,15,0.6)' }} onClick={onCloseMobile} />
    )}
    <aside className={'glass rounded-3xl p-3 sidebar-mobile ' + (mobileOpen ? 'open' : '')}
           style={{ width: 250, position: 'sticky', top: 16, alignSelf: 'flex-start' }}>
      <nav className="flex flex-col gap-1">
        {NAV.map(n => (
          <div key={n.key}
               className={'nav-link ' + (route === n.key ? 'active' : '')}
               onClick={() => { onNav(n.key); onCloseMobile(); }}>
            <Icon name={n.icon} size={17} />
            <span>{n.label}</span>
          </div>
        ))}
      </nav>
      <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--line)' }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--ink-faint)', padding: '0 0.5rem' }}>
          เวอร์ชัน V.1 · ระบบซ่อมบำรุงออนไลน์
        </div>
      </div>
    </aside>
  </>
);

const Footer = () => (
  <div className="text-center py-6" style={{ fontSize: '0.78rem', color: 'var(--ink-faint)' }}>
    © 2026 ผู้พัฒนา Narongsak C - V.1
  </div>
);

// Admin gate dialog
async function adminLogin() {
  const r = await window.Swal.fire({
    title: 'เข้าสู่ระบบผู้ดูแล',
    html:
      '<input id="swl-u" class="swal2-input" placeholder="Username" autocomplete="off"/>' +
      '<input id="swl-p" type="password" class="swal2-input" placeholder="Password"/>',
    focusConfirm: false,
    confirmButtonText: 'เข้าสู่ระบบ',
    showCancelButton: true,
    cancelButtonText: 'ยกเลิก',
    preConfirm: () => {
      const u = document.getElementById('swl-u').value.trim();
      const p = document.getElementById('swl-p').value;
      if (u !== 'admin' || p !== '1234') {
        window.Swal.showValidationMessage('Username หรือ Password ไม่ถูกต้อง');
        return false;
      }
      return { u, p };
    }
  });
  return !!r.isConfirmed;
}

function App() {
  const [db, setDb] = React.useState(() => window.DB.load());
  const [route, setRoute] = useStickyState('mifs.route', 'dashboard');
  const [conn, setConn] = React.useState('offline');
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [adminUnlocked, setAdminUnlocked] = React.useState(false);

  // helpers exposed to pages
  const setDbAndSave = (updater) => {
    setDb(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      window.DB.save(next);
      return next;
    });
  };

  // ----- connectivity actions -----
  const testConn = async (silent) => {
    setConn('loading');
    const r = await window.Api.ping();
    if (r && r.ok) {
      setConn('online');
      if (!silent) toast('success', 'เชื่อมต่อ Google Sheet สำเร็จ');
    } else {
      setConn('offline');
      if (!silent) {
        window.Swal.fire({
          icon: 'warning',
          title: 'ไม่สามารถเชื่อมต่อ Google Sheet ได้',
          html: '<div style="text-align:left;font-size:.92rem;line-height:1.6">' +
                'ระบบจะใช้งานในโหมดออฟไลน์ (เก็บข้อมูลในเครื่อง) ได้ตามปกติ<br/><br/>' +
                '<b>หมายเหตุ:</b> Apps Script Web App ต้อง<br/>' +
                '• Deploy เป็น <code>Web app</code><br/>' +
                '• <code>Execute as: Me</code>, <code>Who has access: Anyone</code><br/>' +
                '• รองรับ action: <code>ping, init, list, append, update, remove, bulkPut</code><br/>' +
                '<small style="color:var(--ink-faint)">รายละเอียด error: ' + ((r && r.error) || 'unknown') + '</small></div>',
        });
      }
    }
  };

  const loadFromCloud = async () => {
    setConn('loading');
    window.Swal.fire({ title: 'กำลังโหลดข้อมูล...', didOpen: () => window.Swal.showLoading(), allowOutsideClick: false });
    const r = await window.Api.init();
    window.Swal.close();
    if (r && r.ok && r.data) {
      setDbAndSave(prev => ({ ...prev, ...r.data }));
      setConn('online');
      toast('success', 'ดึงข้อมูลจาก Google Sheet เรียบร้อย');
    } else {
      setConn('offline');
      window.Swal.fire({
        icon: 'info',
        title: 'ใช้ข้อมูลในเครื่อง',
        text: 'ดึงข้อมูลจาก Google Sheet ไม่ได้ ระบบจะใช้ข้อมูลที่บันทึกไว้ในเครื่องแทน',
      });
    }
  };

  // ping silently on mount
  React.useEffect(() => { testConn(true); }, []);

  // admin gate
  React.useEffect(() => {
    if (route === 'admin' && !adminUnlocked) {
      adminLogin().then(ok => {
        if (ok) setAdminUnlocked(true);
        else setRoute('dashboard');
      });
    }
  }, [route]);

  // ----- page render -----
  const props = { db, setDb: setDbAndSave, nav: setRoute, conn };
  let page = null;
  switch (route) {
    case 'dashboard':    page = <window.PageDashboard {...props} />; break;
    case 'machines':     page = <window.PageMachines {...props} />; break;
    case 'repair-new':   page = <window.PageRepairRequest {...props} />; break;
    case 'repair-track': page = <window.PageRepairTracking {...props} />; break;
    case 'repair-rec':   page = <window.PageRepairRecord {...props} />; break;
    case 'pm':           page = <window.PagePM {...props} />; break;
    case 'history':      page = <window.PageMachineHistory {...props} />; break;
    case 'reports':      page = <window.PageReports {...props} />; break;
    case 'admin':        page = adminUnlocked ? <window.PageAdmin {...props} /> : null; break;
    default: page = <window.PageDashboard {...props} />;
  }

  return (
    <DBContext.Provider value={{ db, setDb: setDbAndSave }}>
      <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-4 lg:py-6">
        <Header db={db} conn={conn}
                onTest={() => testConn(false)} onLoad={loadFromCloud}
                onNav={setRoute} onMenu={() => setMobileOpen(true)} />
        <div className="grid mt-4 gap-4" style={{ gridTemplateColumns: 'auto 1fr' }}>
          <div className="hidden lg:block">
            <Sidebar route={route} onNav={setRoute} mobileOpen={false} onCloseMobile={() => {}} />
          </div>
          <main className="min-w-0" key={route}>
            <div className="fade-in">{page}</div>
          </main>
        </div>
        <Footer />
        {/* Mobile sidebar overlay */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-[75]" style={{ background: 'rgba(2,4,15,0.85)' }} onClick={() => setMobileOpen(false)} />
        )}
        <div className="lg:hidden">
          <Sidebar route={route} onNav={setRoute} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
        </div>
      </div>
    </DBContext.Provider>
  );
}

// Expose
window.useDB = useDB;
window.DBContext = DBContext;
window.App = App;

// Mount immediately (Babel runs these scripts after DOMContentLoaded already fired)
(function mount() {
  const el = document.getElementById('root');
  if (!el) { setTimeout(mount, 30); return; }
  const root = ReactDOM.createRoot(el);
  root.render(<App />);
})();
