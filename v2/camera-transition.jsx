// ============ 相机转场动效 · FLIP 卡片形变 ============

const TRANSITION_DURATION = 520;
const TRANSITION_EASING = 'cubic-bezier(0.5, 0.02, 0.1, 1)';
const OVERLAY_FADE_DURATION = Math.round(TRANSITION_DURATION * 0.55);

const CAMERA_RECOGNITION_MODES = [
  {
    id: 'photo',
    label: '照片',
    capturePhoto: 'image/公园照片.jpg',
    iconSrc: 'assets/record-diary.png',
    resultTitle: '保存为照片记录',
    resultDescription: '未提取到记录项，将只保留这张照片',
    resultNote: '保存后可以在照片下方补充当时的事情和想法',
    saveLabel: '保存照片',
  },
  {
    id: 'period',
    label: '月经',
    capturePhoto: 'image/使用过的量大卫生巾.jpg',
    iconSrc: 'assets/record-flow.png',
    resultTitle: '识别为月经记录',
    resultDescription: '已根据照片估测经量和颜色',
  },
  {
    id: 'discharge',
    label: '白带',
    capturePhoto: 'image/白带.jpeg',
    iconSrc: 'assets/record-discharge.png',
    resultTitle: '识别为白带记录',
    resultDescription: '已根据照片估测颜色和性状',
  },
  {
    id: 'diet',
    label: '饮食',
    capturePhoto: 'assets/gallery/IMG_9140-a0794273-c982-414f-8516-52af2c4456e1.png',
    iconSrc: 'assets/record-diet.png',
    resultTitle: '识别为饮食记录',
    resultDescription: '已识别照片中的主要食物',
  },
  {
    id: 'beverage',
    label: '饮品',
    capturePhoto: 'image/菊花茶饮料.jpg',
    iconSrc: 'assets/record-beverage.svg',
    resultTitle: '识别为饮品记录',
    resultDescription: '已通过包装标签识别饮品名称、品类、容量和热量',
    resultNote: '包装标签信息仅供记录，请以实物标注为准',
    saveLabel: '保存记录',
  },
  {
    id: 'skin',
    label: '皮肤',
    capturePhoto: 'image/长痘.jpg',
    iconSrc: 'assets/record-symptom.png',
    resultTitle: '识别为皮肤状态',
    resultDescription: '已记录照片中可见的皮肤状态',
    resultNote: '仅记录照片中可见状态，不作肤质或疾病诊断',
    saveLabel: '保存状态',
  },
  {
    id: 'cosmetic',
    label: '化妆品',
    capturePhoto: 'image/SK2.jpeg',
    iconSrc: 'assets/record-cosmetic.svg',
    resultTitle: '识别为化妆品',
    resultDescription: '已识别照片中的产品组合',
    resultNote: '请确认产品名称和版本后加入清单',
    saveLabel: '加入在用清单',
  },
  {
    id: 'stool',
    label: '便便',
    capturePhoto: 'image/便便.jpg',
    iconSrc: 'assets/record-stool.png',
    resultTitle: '识别为便便记录',
    resultDescription: '已根据照片估测形态和颜色',
  },
];

const BEVERAGE_OCR_DEMO_PHOTOS = [
  {
    id: 'beverage-coffee-no-label',
    date: '2026-08-01',
    time: '12:10',
    thumb: 'image/咖啡无标签图.jpg',
    type: 'beverage',
    mode: 'beverage',
    recognitionVariant: 'coffee-no-label',
  },
  {
    id: 'beverage-coffee-labeled',
    date: '2026-08-01',
    time: '12:11',
    thumb: 'image/咖啡有标签图.jpg',
    type: 'beverage',
    mode: 'beverage',
    recognitionVariant: 'coffee-labeled',
  },
];

const BEVERAGE_OCR_CAPTURE_SEQUENCE = [
  BEVERAGE_OCR_DEMO_PHOTOS[0],
  {
    ...BEVERAGE_OCR_DEMO_PHOTOS[0],
    id: 'beverage-coffee-no-label-fallback',
    recognitionVariant: 'coffee-no-label-fallback',
  },
  BEVERAGE_OCR_DEMO_PHOTOS[1],
];

let beverageOcrCaptureIndex = 0;

function getNextBeverageOcrDemoPhoto() {
  const photo = BEVERAGE_OCR_CAPTURE_SEQUENCE[beverageOcrCaptureIndex % BEVERAGE_OCR_CAPTURE_SEQUENCE.length];
  beverageOcrCaptureIndex += 1;
  return photo;
}

const CAMERA_RECOGNITION_MODE_MAP = CAMERA_RECOGNITION_MODES.reduce((map, mode) => {
  map[mode.id] = mode;
  return map;
}, {});

function getCameraRecognitionMode(modeId) {
  return CAMERA_RECOGNITION_MODE_MAP[modeId] || CAMERA_RECOGNITION_MODE_MAP.period;
}

const AUTO_DETECT_DEMO_PHOTOS = CAMERA_RECOGNITION_MODES.flatMap((mode, index) => {
  const photos = [{
    id: `auto-detect-${mode.id}`,
    date: '2026-07-27',
    time: `09:${String(41 + index).padStart(2, '0')}`,
    thumb: mode.capturePhoto,
    type: mode.id,
    mode: mode.id,
  }];
  if (mode.id === 'beverage') {
    photos.push({
      id: 'auto-detect-beverage-starbucks',
      date: '2026-07-27',
      time: '09:46',
      thumb: 'image/星巴克红茶拿铁.webp',
      type: 'beverage',
      mode: 'beverage',
      recognitionVariant: 'starbucks',
    });
    photos.push(...BEVERAGE_OCR_DEMO_PHOTOS);
  }
  return photos;
});

let autoDetectCaptureIndex = 0;

function getNextAutoDetectDemoPhoto() {
  const photo = AUTO_DETECT_DEMO_PHOTOS[autoDetectCaptureIndex % AUTO_DETECT_DEMO_PHOTOS.length];
  autoDetectCaptureIndex += 1;
  return photo;
}

function inferCameraRecognitionMode(photo) {
  const candidate = photo?.mode || photo?.type;
  if (candidate === 'food') return 'diet';
  return CAMERA_RECOGNITION_MODE_MAP[candidate] ? candidate : 'photo';
}

function buildCameraRecognitionResult(payload) {
  const mode = inferCameraRecognitionMode(payload?.photo || payload);
  const base = { ...payload, mode };
  const sourcePhoto = payload?.photo || payload;
  if (sourcePhoto?.recognitionVariant === 'coffee-no-label-fallback') {
    return {
      ...base,
      mode: 'photo',
      fallbackFromBeverage: true,
      summary: '',
      summaryItems: [],
    };
  }
  if (mode === 'photo') {
    return {
      ...base,
      summary: '',
      summaryItems: [],
    };
  }
  if (mode === 'period') {
    return {
      ...base,
      summary: '经量多，颜色鲜红色',
      summaryItems: [
        { label: '经量', value: '多' },
        { label: '颜色', value: '鲜红色' },
      ],
    };
  }
  if (mode === 'discharge') {
    return {
      ...base,
      summary: '淡黄色，黏稠',
      summaryItems: [
        { label: '颜色', value: '淡黄色' },
        { label: '性状', value: '黏稠' },
      ],
    };
  }
  if (mode === 'beverage') {
    const isStarbucks = sourcePhoto?.recognitionVariant === 'starbucks'
      || sourcePhoto?.thumb === 'image/星巴克红茶拿铁.webp';
    if (isStarbucks) {
      return {
        ...base,
        brand: '星巴克',
        beverageName: '红茶咖啡拿铁鸳鸯',
        beverageCategory: '咖啡',
        capacityMl: 500,
        iceLevel: '',
        sugarLevel: '',
        spec: '500ml',
        calories: 286,
        caffeineMg: 95,
        summary: '星巴克红茶咖啡拿铁鸳鸯 · 500ml',
        summaryItems: [
          { label: '饮品', value: '星巴克 · 红茶咖啡拿铁鸳鸯' },
          { label: '品类', value: '咖啡' },
          { label: '容量', value: '500ml' },
          { label: '热量', value: '286 千卡' },
          { label: '咖啡因', value: '95 毫克' },
        ],
      };
    }
    if (sourcePhoto?.recognitionVariant === 'coffee-labeled') {
      return {
        ...base,
        brand: '',
        beverageName: '桃子冰美式',
        beverageCategory: '咖啡',
        capacityMl: 700,
        iceLevel: '',
        sugarLevel: '',
        spec: '700ml',
        calories: 128,
        caffeineMg: 120,
        summary: '桃子冰美式 · 700ml',
        summaryItems: [
          { label: '饮品', value: '桃子冰美式' },
          { label: '品类', value: '咖啡' },
          { label: '容量', value: '700ml' },
          { label: '热量', value: '128 千卡' },
          { label: '咖啡因', value: '120 毫克' },
        ],
      };
    }
    return {
      ...base,
      brand: '鸳鸯',
      beverageName: '小菊菊花植物饮料',
      beverageCategory: '饮料',
      capacityMl: 248,
      iceLevel: '',
      sugarLevel: '',
      spec: '248ml',
      calories: 17,
      caffeineMg: 0,
      summary: '鸳鸯小菊菊花植物饮料 · 248ml',
      summaryItems: [
        { label: '饮品', value: '鸳鸯 · 小菊菊花植物饮料' },
        { label: '品类', value: '饮料' },
        { label: '容量', value: '248ml' },
        { label: '热量', value: '17 千卡' },
      ],
    };
  }
  if (mode === 'skin') {
    return {
      ...base,
      area: '面颊',
      acne: '少量可见',
      redness: '轻微',
      acneMarks: '少量',
      summary: '面颊有少量可见痘痘，轻微泛红',
      summaryItems: [
        { label: '部位', value: '面颊' },
        { label: '痘痘', value: '少量可见' },
        { label: '泛红', value: '轻微' },
        { label: '痘印', value: '少量' },
      ],
    };
  }
  if (mode === 'cosmetic') {
    return {
      ...base,
      brand: 'SK-II',
      product: '护肤精华露等4件',
      managementStatus: '正在使用',
      summary: 'SK-II 护肤精华露等4件 · 正在使用',
      summaryItems: [
        { label: '品牌', value: 'SK-II' },
        { label: '产品', value: '护肤精华露等4件' },
        { label: '管理状态', value: '正在使用' },
      ],
    };
  }
  if (mode === 'stool') {
    return {
      ...base,
      summary: '布里斯托 2 型，黄褐色',
      summaryItems: [
        { label: '形态', value: '布里斯托 2 型' },
        { label: '颜色', value: '黄褐色' },
      ],
    };
  }
  return {
    ...base,
    summary: '鸡肉吐司，约 510 千卡',
    summaryItems: [
      { label: '食物', value: '鸡肉吐司' },
      { label: '热量', value: '约 510 千卡' },
    ],
  };
}

function measureElementRect(el, container) {
  if (!el || !container) return null;
  
  const elRect = el.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  
  return {
    left: elRect.left - containerRect.left,
    top: elRect.top - containerRect.top,
    width: elRect.width,
    height: elRect.height,
  };
}

// 模拟相册照片数据（真实用户图片）
const MOCK_PHOTOS = [
  { id: 'p0', date: '2026-07-30', time: '18:20', thumb: 'image/公园照片.jpg', type: 'photo', mode: 'photo' },
  { id: 'p1', date: '2026-06-03', time: '12:35', thumb: 'assets/gallery/IMG_9140-a0794273-c982-414f-8516-52af2c4456e1.png', type: 'food' },
  { id: 'p2', date: '2026-06-03', time: '11:20', thumb: 'assets/gallery/IMG_9145_2-72cf62bb-2ea4-45fa-977a-78f80ac3da58.png', type: 'food' },
  { id: 'p3', date: '2026-06-03', time: '10:15', thumb: 'assets/gallery/IMG_9139-a36f2639-6b62-453c-bdc1-2d7cd67b4d28.png', type: 'food' },
  { id: 'p4', date: '2026-06-03', time: '09:30', thumb: 'assets/gallery/IMG_9144-803d342e-cc05-4834-943e-4c52e0bad0d3.png', type: 'food' },
  { id: 'p5', date: '2026-06-02', time: '19:30', thumb: 'assets/gallery/IMG_9128-7218d6e2-498b-4980-8a99-218909c9881d.png', type: 'food' },
  { id: 'p6', date: '2026-06-02', time: '12:45', thumb: 'assets/gallery/IMG_9137-a082d61f-1417-483d-9122-37c8ebcb2861.png', type: 'food' },
  { id: 'p7', date: '2026-06-02', time: '08:00', thumb: 'assets/gallery/IMG_9129-0b57a26b-182e-49cc-ad71-7b972274a436.png', type: 'food' },
  { id: 'p8', date: '2026-06-01', time: '20:15', thumb: 'assets/gallery/IMG_9130-49592824-80e2-4ef5-a0c4-d094130b01d4.png', type: 'food' },
  { id: 'p9', date: '2026-06-01', time: '13:00', thumb: 'assets/gallery/IMG_9127-d09a43af-ea30-4eea-b165-d501765c5244.png', type: 'food' },
  { id: 'p10', date: '2026-06-01', time: '07:45', thumb: 'assets/gallery/1779691515990-7a645e8f-02b5-44f1-8fe5-7c60f1f4cc40.png', type: 'food' },
];

const PHOTO_PICKER_PLACEHOLDERS = Array.from({ length: 17 }, (_, index) => ({
  id: `placeholder-${index}`,
  placeholder: true,
  thumb: MOCK_PHOTOS[index % MOCK_PHOTOS.length].thumb,
}));

const PHOTO_PICKER_ITEMS = [
  ...AUTO_DETECT_DEMO_PHOTOS,
  ...MOCK_PHOTOS.filter((photo) => !AUTO_DETECT_DEMO_PHOTOS.some((demo) => demo.thumb === photo.thumb)),
  ...PHOTO_PICKER_PLACEHOLDERS,
];

const DIET_DEMO_PHOTOS = MOCK_PHOTOS
  .filter((photo) => photo.type === 'food' || photo.mode === 'diet')
  .map((photo, index) => ({
    ...photo,
    id: `diet-demo-${photo.id || index}`,
    type: 'diet',
    mode: 'diet',
  }));

let dietCaptureIndex = 0;

function getNextDietDemoPhoto() {
  const list = DIET_DEMO_PHOTOS.length
    ? DIET_DEMO_PHOTOS
    : [{
        id: 'diet-fallback',
        thumb: CAMERA_RECOGNITION_MODE_MAP.diet.capturePhoto,
        type: 'diet',
        mode: 'diet',
      }];
  const photo = list[dietCaptureIndex % list.length];
  dietCaptureIndex += 1;
  return photo;
}

function getPhotoPickerItems(preferredMode = null) {
  if (preferredMode === 'diet') {
    const foodThumbs = new Set(DIET_DEMO_PHOTOS.map((photo) => photo.thumb));
    const foodPlaceholders = PHOTO_PICKER_PLACEHOLDERS
      .filter((photo) => foodThumbs.has(photo.thumb) || photo.thumb?.includes('gallery/'))
      .map((photo, index) => ({ ...photo, id: `diet-placeholder-${index}` }));
    return [
      ...DIET_DEMO_PHOTOS,
      ...foodPlaceholders,
    ];
  }
  return PHOTO_PICKER_ITEMS;
}

function PhotoPicker({ onSelect, onClose, preferredMode = null }) {
  const I = window.Icon;
  const [activeTab, setActiveTab] = React.useState('photos');
  const pickerItems = getPhotoPickerItems(preferredMode);

  return (
    <div className="photo-picker">
      <div className="photo-picker-header">
        <button type="button" className="photo-picker-close" onClick={onClose} aria-label="关闭">
          <I name="x" size={20} stroke={2.2} />
        </button>
        <div className="photo-picker-tabs" role="tablist" aria-label="相册类型">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'photos'}
            className={'photo-picker-tab' + (activeTab === 'photos' ? ' is-active' : '')}
            onClick={() => setActiveTab('photos')}
          >
            照片
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'collections'}
            className={'photo-picker-tab' + (activeTab === 'collections' ? ' is-active' : '')}
            onClick={() => setActiveTab('collections')}
          >
            精选集
          </button>
        </div>
        <div className="photo-picker-header-spacer" aria-hidden="true" />
      </div>

      <div className="photo-picker-content">
        {activeTab === 'photos' ? (
          <div className="photo-grid">
            {pickerItems.map(photo => (
              photo.placeholder ? (
                <div
                  key={photo.id}
                  className="photo-item is-placeholder"
                  aria-hidden="true"
                >
                  <img src={photo.thumb} alt="" loading="lazy" />
                </div>
              ) : (
                <button
                  key={photo.id}
                  type="button"
                  className="photo-item"
                  onClick={() => onSelect(photo)}
                >
                  <img src={photo.thumb} alt="" loading="lazy" />
                </button>
              )
            ))}
          </div>
        ) : (
          <div className="photo-picker-empty">暂无精选集</div>
        )}
      </div>

      <div className="photo-picker-floats">
        <button type="button" className="photo-picker-float-btn" aria-label="更多">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M3 4.5h12M3 9h12M3 13.5h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </button>
        <button type="button" className="photo-picker-float-btn" aria-label="搜索">
          <I name="search" size={18} stroke={2} />
        </button>
      </div>
    </div>
  );
}

function PhotoPickerSheet({ onSelect, onClose, preferredMode = null }) {
  const [entered, setEntered] = React.useState(false);

  React.useEffect(() => {
    const frame = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className={'photo-picker-sheet' + (entered ? ' is-open' : '')}>
      <button
        type="button"
        className="photo-picker-sheet-backdrop"
        onClick={onClose}
        aria-label="关闭相册"
      />
      <div className="photo-picker-sheet-panel">
        <PhotoPicker onSelect={onSelect} onClose={onClose} preferredMode={preferredMode} />
      </div>
    </div>
  );
}

const SHOOT_EXAMPLE_GOOD = 'assets/camera/shoot-example-good.png';
const SHOOT_EXAMPLE_BAD = 'assets/camera/shoot-example-bad.png';
function CameraShootingGuideSheet({ onClose }) {
  const [entered, setEntered] = React.useState(false);

  React.useEffect(() => {
    const frame = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className={'camera-guide-sheet' + (entered ? ' is-open' : '')}>
      <button
        type="button"
        className="camera-guide-sheet-backdrop"
        onClick={onClose}
        aria-label="关闭拍摄示例"
      />
      <div className="camera-guide-sheet-panel" role="dialog" aria-modal="true" aria-labelledby="camera-guide-title">
        <h2 id="camera-guide-title" className="camera-guide-title">拍摄示例</h2>
        <p className="camera-guide-subtitle">请上传或拍摄如左图所示的食物照片</p>
        <div className="camera-guide-examples">
          <div className="camera-guide-example">
            <div className="camera-guide-example-photo">
              <img src={SHOOT_EXAMPLE_GOOD} alt="推荐拍摄示例" loading="lazy" />
            </div>
            <div className="camera-guide-badge is-good" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M4.5 9.2l2.6 2.6 6.4-6.8" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <div className="camera-guide-example">
            <div className="camera-guide-example-photo">
              <img src={SHOOT_EXAMPLE_BAD} alt="不推荐拍摄示例" loading="lazy" />
            </div>
            <div className="camera-guide-badge is-bad" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M5.4 5.4l7.2 7.2M12.6 5.4l-7.2 7.2" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
        </div>
        <button type="button" className="camera-guide-confirm" onClick={onClose}>
          知道了
        </button>
      </div>
    </div>
  );
}

const CAMERA_PERMISSION_SCENARIO_KEY = 'my-demo-camera-permission-scenario';

const CAMERA_PERMISSION_SCENARIOS = [
  { value: 'unauthorized', label: '场景1 · 未授权' },
  { value: 'authorized', label: '场景2 · 已授权' },
  // text-diet（原场景3 · 文字/语音饮食）已从演示条隐藏，逻辑仍保留在 isDietTextRecordScenario
];

function isCameraPermissionScenario(value) {
  return value === 'unauthorized' || value === 'authorized';
}

function isDietTextRecordScenario(value) {
  return value === 'text-diet'
    || value === 'text-names-only'
    || value === 'text-with-portion';
}

function readCameraPermissionScenario() {
  try {
    const value = sessionStorage.getItem(CAMERA_PERMISSION_SCENARIO_KEY) || 'unauthorized';
    if (value === 'text-diet' || value === 'text-names-only' || value === 'text-with-portion') {
      return 'authorized';
    }
    return value;
  } catch {
    return 'unauthorized';
  }
}

function writeCameraPermissionScenario(value) {
  try {
    sessionStorage.setItem(CAMERA_PERMISSION_SCENARIO_KEY, value);
    window.dispatchEvent(new Event('cameraPermissionScenarioChange'));
  } catch {}
}

function CameraPermissionIcon() {
  return (
    <div className="camera-perm-icon" aria-hidden="true">
      <div className="camera-perm-icon-main">
        <svg width="28" height="22" viewBox="0 0 28 22" fill="none">
          <path
            d="M3 6.5A2.5 2.5 0 015.5 4h4.2l2.2-2.4A1.2 1.2 0 0012.6 1h2.8c.4 0 .8.2 1 .5L18.6 4H23A2.5 2.5 0 0125.5 6.5v11A2.5 2.5 0 0123 20H5.5A2.5 2.5 0 013 17.5v-11z"
            fill="#fff"
          />
          <circle cx="14.5" cy="12" r="4.2" fill="#8E8E93"/>
          <circle cx="14.5" cy="12" r="2.6" fill="#fff"/>
        </svg>
      </div>
      <div className="camera-perm-icon-badge">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect width="14" height="14" rx="3" fill="#007AFF"/>
          <path
            d="M4.2 6.8c0-1 .8-1.8 1.8-1.8h.4c.5 0 .9.4.9.9v.2c0 .5-.4.9-.9.9h-.4c-.2 0-.4.2-.4.4v2.2c0 .3.2.5.5.5h.6c.3 0 .5.2.5.5v.2c0 .5-.4.9-.9.9H5.5c-.5 0-.9-.4-.9-.9V6.8z"
            fill="#fff"
          />
          <path
            d="M8.8 4.8c0-.5.4-.9.9-.9h.8c.5 0 .9.4.9.9v5.6c0 .5-.4.9-.9.9h-.8c-.5 0-.9-.4-.9-.9V4.8z"
            fill="#fff"
          />
          <path d="M8.3 9.8h2.8v1.4H8.3V9.8z" fill="#fff"/>
        </svg>
      </div>
    </div>
  );
}

function CameraPermissionDialog({ onAllow, onDeny }) {
  return (
    <div className="camera-perm-overlay" role="dialog" aria-modal="true" aria-labelledby="camera-perm-title">
      <div className="camera-perm-dialog">
        <CameraPermissionIcon/>
        <h2 id="camera-perm-title" className="camera-perm-title">美柚想访问相机</h2>
        <p className="camera-perm-subtitle">用于记录生活照片并智能识别饮食、饮品等内容，请允许美柚访问相机</p>
        <div className="camera-perm-actions">
          <button type="button" className="camera-perm-btn" onClick={onDeny}>不允许</button>
          <button type="button" className="camera-perm-btn" onClick={onAllow}>允许</button>
        </div>
      </div>
    </div>
  );
}

function PhotoLibraryIcon() {
  return (
    <div className="photo-lib-perm-icon" aria-hidden="true">
      <svg className="photo-lib-perm-icon-main" width="56" height="56" viewBox="0 0 56 56" fill="none">
        <rect width="56" height="56" rx="13" fill="url(#photoLibGrad)"/>
        <path d="M28 16c-5.2 0-9.4 4-9.4 8.9 0 4.2 2.8 7.7 6.6 8.7-1.1.8-1.8 2.1-1.8 3.5 0 2.5 2.1 4.5 4.6 4.5s4.6-2 4.6-4.5c0-1.4-.7-2.7-1.8-3.5 3.8-1 6.6-4.5 6.6-8.7C37.4 20 33.2 16 28 16z" fill="#fff" opacity="0.95"/>
        <circle cx="20" cy="22" r="3" fill="#FFD60A"/>
        <circle cx="36" cy="34" r="2.5" fill="#34C759"/>
        <circle cx="31" cy="24" r="2" fill="#FF9500"/>
        <defs>
          <linearGradient id="photoLibGrad" x1="8" y1="6" x2="48" y2="50" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FF7BAC"/>
            <stop offset="0.35" stopColor="#FFD56A"/>
            <stop offset="0.65" stopColor="#65D6FF"/>
            <stop offset="1" stopColor="#B58BFF"/>
          </linearGradient>
        </defs>
      </svg>
      <span className="photo-lib-perm-icon-badge">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="9" r="9" fill="#007AFF"/>
          <path d="M6.2 8.4c0-.8.6-1.4 1.4-1.4h.3c.4 0 .7.3.7.7v.2c0 .4-.3.7-.7.7h-.3c-.2 0-.3.1-.3.3v1.8c0 .2.2.4.4.4h.5c.2 0 .4.2.4.4v.2c0 .4-.3.7-.7.7H6.9c-.4 0-.7-.3-.7-.7V8.4z" fill="#fff"/>
          <path d="M10.8 6.6c0-.4.3-.7.7-.7h.6c.4 0 .7.3.7.7v4.6c0 .4-.3.7-.7.7h-.6c-.4 0-.7-.3-.7-.7V6.6z" fill="#fff"/>
        </svg>
      </span>
    </div>
  );
}

function PhotoLibraryPermissionDialog({ onAllowFull, onLimit, onDeny }) {
  const previewPhotos = MOCK_PHOTOS.slice(0, 8);

  return (
    <div className="photo-lib-perm-overlay" role="dialog" aria-modal="true" aria-labelledby="photo-lib-perm-title">
      <div className="photo-lib-perm-dialog">
        <PhotoLibraryIcon/>
        <h2 id="photo-lib-perm-title" className="photo-lib-perm-title">“美柚”想完全访问你的照片图库。</h2>
        <p className="photo-lib-perm-subtitle">为了从图片中识别记录内容，请授予相册访问权限。</p>
        <div className="photo-lib-perm-grid">
          {previewPhotos.map((photo) => (
            <div key={photo.id} className="photo-lib-perm-grid-item">
              <img src={photo.thumb} alt="" loading="lazy" />
            </div>
          ))}
        </div>
        <p className="photo-lib-perm-stats">32,414 张照片、924 个视频</p>
        <p className="photo-lib-perm-note">照片可能包含与位置、景深信息、说明和音频关联的数据。</p>
        <div className="photo-lib-perm-actions">
          <button type="button" className="photo-lib-perm-btn" onClick={onLimit}>限制访问...</button>
          <button type="button" className="photo-lib-perm-btn" onClick={onAllowFull}>允许完全访问</button>
          <button type="button" className="photo-lib-perm-btn" onClick={onDeny}>不允许</button>
        </div>
      </div>
    </div>
  );
}

function PermissionPrivacyNote() {
  return (
    <p className="camera-perm-blocked-privacy">
      <svg className="camera-perm-blocked-shield" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 2.5l7.5 3.75V11c0 4.55-3.1 8.35-7.5 9.25-4.4-.9-7.5-4.7-7.5-9.25V6.25L12 2.5z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M9.5 12.2l1.8 1.8 3.7-3.9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span>美柚将保护你的隐私，你也可随时关闭授权</span>
    </p>
  );
}

function CameraPermissionBlocked({ onEnable }) {
  const I = window.Icon;

  return (
    <div className="camera-perm-blocked">
      <div className="camera-perm-blocked-body">
        <h2 className="camera-perm-blocked-title">允许开启以下权限即可智能拍照记录</h2>
        <div className="camera-perm-blocked-col">
          <PermissionPrivacyNote />
          <div className="camera-perm-blocked-list">
            <div className="camera-perm-blocked-item">
              <span className="camera-perm-blocked-item-ico" aria-hidden="true">
                <I name="camera" size={20} stroke={1.5} />
              </span>
              <div className="camera-perm-blocked-item-text">
                <span className="camera-perm-blocked-item-title">允许访问相机</span>
                <span className="camera-perm-blocked-item-desc">用于拍摄照片</span>
              </div>
            </div>
          </div>
          <button type="button" className="camera-perm-blocked-enable" onClick={onEnable}>
            立即开启
          </button>
        </div>
      </div>
    </div>
  );
}

function CameraRecognitionResult({ result, onChange, onRetake, onSave }) {
  const modeConfig = getCameraRecognitionMode(result?.mode);
  const isPhoto = result?.mode === 'photo';
  const isWeight = result?.mode === 'weight';
  const isNumeric = isWeight;
  const numericValue = result?.value ?? '';
  const isValid = !isNumeric || Number(numericValue) > 0;
  const resultNote = modeConfig.resultNote || (
    ['period', 'discharge', 'stool'].includes(result?.mode)
      ? 'AI 估测结果仅用于辅助记录，不作医学诊断'
      : ''
  );

  return (
    <div className={'camera-recognition-result is-' + result.mode}>
      <span className="camera-result-handle" aria-hidden="true"/>
      <div className="camera-result-status">
        <span className="camera-result-check" aria-hidden="true">{isPhoto ? '●' : '✓'}</span>
        <span>{isPhoto ? '普通照片' : 'AI 自动分类完成'}</span>
      </div>
      <div className="camera-result-heading">
        <div>
          <h2>{modeConfig.resultTitle}</h2>
          <p>{modeConfig.resultDescription}</p>
        </div>
        <span className={'camera-result-type-icon is-' + result.mode} aria-hidden="true">
          <img src={modeConfig.iconSrc} alt="" />
        </span>
      </div>
      {isPhoto ? (
        <div className="camera-result-photo-message">
          <span aria-hidden="true">照片</span>
          <p>没有识别到饮食或饮品信息，本次不会生成健康记录项。</p>
        </div>
      ) : isNumeric ? (
        <div className="camera-result-value-row">
          <input
            className="camera-result-value-input"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.1"
            aria-label="体重数值"
            value={numericValue}
            onChange={(event) => onChange?.({ ...result, value: event.target.value })}
          />
          <div className="camera-result-unit-switch" role="group" aria-label="体重单位">
            <button
              type="button"
              className={result.unit === 'jin' ? 'is-active' : ''}
              onClick={() => onChange?.({ ...result, unit: 'jin' })}
            >
              斤
            </button>
            <button
              type="button"
              className={result.unit === 'kg' ? 'is-active' : ''}
              onClick={() => onChange?.({ ...result, unit: 'kg' })}
            >
              kg
            </button>
          </div>
        </div>
      ) : (
        <div className="camera-result-summary">
          {(result?.summaryItems || []).map((item) => (
            <div className="camera-result-summary-item" key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      )}
      {resultNote ? (
        <p className="camera-result-estimate-note">{resultNote}</p>
      ) : null}
      <div className="camera-result-actions">
        <button type="button" className="camera-result-retake" onClick={onRetake}>
          重拍
        </button>
        <button
          type="button"
          className="camera-result-save"
          onClick={onSave}
          disabled={!isValid}
        >
          {modeConfig.saveLabel || '保存记录'}
        </button>
      </div>
    </div>
  );
}

function CameraCaptureAnalyzePanel({
  phase,
  progress = 0,
  analyzeMode = null,
  errorKind = null,
  onRetry,
  onRetake,
  showRetry,
  isExhausted,
}) {
  const isLoading = phase === 'loading';
  const isTimeoutError = phase === 'error' && errorKind === 'timeout';
  const isNotFoodError = phase === 'error' && errorKind === 'not-food';
  const isBeverageNoLabelError = phase === 'error' && errorKind === 'beverage-no-label';
  const loadingSteps = analyzeMode === 'beverage'
    ? ['饮品识别中', '成分分析中', '热量咖啡因容量统计中']
    : ['内容识别中', '信息分析中', '记录整理中'];
  const loadingStep = loadingSteps[progress < 36 ? 0 : progress < 72 ? 1 : 2];
  return (
    <div className={'camera-analyze-sheet' + (isLoading ? ' is-loading' : '') + (phase === 'error' ? ' is-error' : '') + (isNotFoodError ? ' is-not-food' : '') + (isBeverageNoLabelError ? ' is-beverage-no-label' : '')}>
      <div className="camera-analyze-progress-track" aria-hidden={!isLoading}>
        <div
          className="camera-analyze-progress-fill"
          style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
        />
        {isLoading ? (
          <img
            className="camera-analyze-progress-logo"
            src="image/美柚logo.png"
            alt=""
            style={{ left: `calc(${Math.max(4, Math.min(96, progress))}% - 14px)` }}
          />
        ) : null}
      </div>
      <div className="camera-analyze-status-row">
        {isLoading && (
          <div className="camera-analyze-loading-copy">
            <strong>AI小柚子分析中…</strong>
            <span key={loadingStep}>{loadingStep}</span>
          </div>
        )}
        {isTimeoutError && !isExhausted && (
          <>
            <span className="camera-analyze-status-text">AI识别遇到点小问题</span>
            <div className="camera-analyze-actions">
              {showRetry && (
                <button type="button" className="camera-analyze-action-btn" onClick={onRetry}>
                  重试
                </button>
              )}
              <button type="button" className="camera-analyze-action-btn" onClick={onRetake}>
                重拍
              </button>
            </div>
          </>
        )}
        {isTimeoutError && isExhausted && (
          <>
            <span className="camera-analyze-status-text camera-analyze-status-text--muted">
              识别失败，请重拍一张
            </span>
            <button type="button" className="camera-analyze-action-btn" onClick={onRetake}>
              重拍
            </button>
          </>
        )}
        {isNotFoodError && (
          <>
            <span className="camera-analyze-status-text">没有检测到食物，重拍一张</span>
            <button type="button" className="camera-analyze-action-btn" onClick={onRetake}>
              重拍
            </button>
          </>
        )}
        {isBeverageNoLabelError && (
          <div className="camera-analyze-label-guide">
            <strong>未识别到有效饮品标签</strong>
            <p>请对准杯身标签重新拍摄，确保饮品名称、容量等信息清晰可见。</p>
            <button type="button" className="camera-analyze-label-retake" onClick={onRetake}>
              重拍
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function useCameraPhotoAnalyze({ onSuccess, onAnalyzeStart }) {
  const loadingMs = window.PHOTO_ANALYZE_LOADING_MS || 5000;
  const mockRecognize = window.mockRecognizeDietPhoto || (() => ({ ok: true }));
  const readScenario = window.readDietRecognitionScenario || (() => 'success');
  const getMaxFailures = window.getDietRecognitionMaxFailures || (() => 5);
  const resolveAnalyzeMs = window.getDietRecognitionAnalyzeMs || ((scenario, ms) => ms);

  const [phase, setPhase] = React.useState(null);
  const [photoUrl, setPhotoUrl] = React.useState(null);
  const [progress, setProgress] = React.useState(0);
  const [failureCount, setFailureCount] = React.useState(0);
  const [errorKind, setErrorKind] = React.useState(null);
  const [analyzeMode, setAnalyzeMode] = React.useState(null);
  const analyzeTimerRef = React.useRef(null);
  const progressTimerRef = React.useRef(null);
  const finishTimerRef = React.useRef(null);

  const scenario = readScenario();
  const maxFailures = getMaxFailures(scenario);
  const isExhausted = phase === 'error' && errorKind === 'timeout' && failureCount >= maxFailures;

  const clearTimers = React.useCallback(() => {
    if (analyzeTimerRef.current) {
      window.clearTimeout(analyzeTimerRef.current);
      analyzeTimerRef.current = null;
    }
    if (progressTimerRef.current) {
      window.clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
    if (finishTimerRef.current) {
      window.clearTimeout(finishTimerRef.current);
      finishTimerRef.current = null;
    }
  }, []);

  const reset = React.useCallback(() => {
    clearTimers();
    setPhase(null);
    setPhotoUrl(null);
    setProgress(0);
    setFailureCount(0);
    setErrorKind(null);
    setAnalyzeMode(null);
  }, [clearTimers]);

  const runAnalyze = React.useCallback(({ url, isRetry = false, forceSuccess = false, meta } = {}) => {
    if (!url) return;
    clearTimers();
    setPhotoUrl(url);
    setPhase('loading');
    setProgress(6);
    setErrorKind(null);
    if (!isRetry) setFailureCount(0);
    onAnalyzeStart?.();

    const recognitionMode = meta?.mode || 'diet';
    setAnalyzeMode(recognitionMode);
    const activeScenario = recognitionMode === 'diet' ? readScenario() : 'success';
    const analyzeMs = recognitionMode === 'diet'
      ? resolveAnalyzeMs(activeScenario, loadingMs)
      : recognitionMode === 'beverage'
        ? 6000
        : 2600;
    const isBeverageNoLabel = recognitionMode === 'beverage'
      && meta?.photo?.recognitionVariant === 'coffee-no-label';
    const isEarlySuccess = activeScenario === 'success';
    const startedAt = Date.now();
    progressTimerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const pct = Math.min(isEarlySuccess ? 86 : 92, 6 + (elapsed / analyzeMs) * 86);
      setProgress(pct);
    }, 100);

    analyzeTimerRef.current = window.setTimeout(() => {
      clearTimers();
      const result = isBeverageNoLabel
        ? { ok: false, reason: 'beverage-no-label' }
        : recognitionMode === 'diet'
          ? mockRecognize({ scenario: readScenario(), forceSuccess })
          : { ok: true };
      if (result?.ok) {
        setProgress(100);
        setPhase('ready');
        finishTimerRef.current = window.setTimeout(() => {
          onSuccess?.({ photoUrl: url, ...meta });
        }, 160);
        return;
      }
      setProgress(0);
      setPhase('error');
      setErrorKind(
        result?.reason === 'not-food'
          ? 'not-food'
          : result?.reason === 'beverage-no-label'
            ? 'beverage-no-label'
            : 'timeout'
      );
      if (isRetry && result?.reason !== 'not-food') {
        setFailureCount((count) => count + 1);
      }
    }, analyzeMs);
  }, [clearTimers, loadingMs, mockRecognize, onAnalyzeStart, onSuccess, readScenario, reset, resolveAnalyzeMs]);

  const handleRetry = React.useCallback((event) => {
    if (phase !== 'error' || errorKind !== 'timeout' || failureCount >= maxFailures || !photoUrl) return;
    const forceSuccess = !!(event?.altKey || event?.metaKey);
    runAnalyze({ url: photoUrl, isRetry: true, forceSuccess });
  }, [errorKind, failureCount, maxFailures, phase, photoUrl, runAnalyze]);

  const handleRetake = React.useCallback(() => {
    clearTimers();
    setPhase(null);
    setPhotoUrl(null);
    setProgress(0);
    setFailureCount(0);
    setErrorKind(null);
    setAnalyzeMode(null);
  }, [clearTimers]);

  React.useEffect(() => () => clearTimers(), [clearTimers]);

  return {
    phase,
    photoUrl,
    progress,
    failureCount,
    maxFailures,
    errorKind,
    analyzeMode,
    isExhausted,
    runAnalyze,
    handleRetry,
    handleRetake,
    reset,
    isAnalyzing: phase != null,
  };
}

function CameraView({
  onCapture,
  onClose,
  onOpenGallery,
  visible,
  permPending,
  permDenied,
  showPhotoPermDialog,
  showGallery,
  onCloseGallery,
  onSelectPhoto,
  onPermissionAllow,
  onPermissionDeny,
  onPermissionEnable,
  onPhotoPermAllowFull,
  onPhotoPermLimit,
  onPhotoPermDeny,
  analyzePhase = null,
  capturedPhotoUrl = null,
  analyzeProgress = 0,
  analyzeFailureCount = 0,
  analyzeMaxFailures = 5,
  analyzeExhausted = false,
  analyzeErrorKind = null,
  analyzeMode = null,
  onAnalyzeRetry,
  onAnalyzeRetake,
  recognitionResult,
  onRecognitionChange,
  onRecognitionSave,
  preferredRecognitionMode = null,
}) {
  const I = window.Icon;
  const [flash, setFlash] = React.useState(false);
  
  const handleCapture = () => {
    if (permPending || permDenied || analyzePhase) return;
    setFlash(true);
    setTimeout(() => {
      setFlash(false);
      onCapture?.();
    }, 150);
  };

  const showAnalyze = !!analyzePhase;
  const showPreview = !!capturedPhotoUrl;
  
  return (
    <div className={'camera-view' + (visible ? ' is-visible' : '') + (permPending ? ' is-perm-pending' : '') + (permDenied ? ' is-perm-denied' : '') + (showGallery ? ' is-gallery-open' : '') + (showAnalyze ? ' is-analyzing' : '')}>
      <button type="button" className="camera-close-btn" onClick={onClose} aria-label="返回">
        <I name="chevron-left" size={24} stroke={2.2} />
      </button>
      
      <div className="camera-main">
        {permDenied ? (
          <CameraPermissionBlocked onEnable={onPermissionEnable} />
        ) : showPreview ? (
          <div className="camera-capture-stage">
            <img src={capturedPhotoUrl} alt="" className="camera-capture-photo"/>
            <span className="camera-frame-corner tl"/>
            <span className="camera-frame-corner tr"/>
            <span className="camera-frame-corner bl"/>
            <span className="camera-frame-corner br"/>
            {analyzePhase === 'loading' && <div className="camera-scan-line" aria-hidden="true"/>}
          </div>
        ) : (
          <>
            <div className="camera-frame">
              {permPending && (
                <CameraPermissionDialog
                  onAllow={onPermissionAllow}
                  onDeny={onPermissionDeny}
                />
              )}
              <span className="camera-frame-corner tl"/>
              <span className="camera-frame-corner tr"/>
              <span className="camera-frame-corner bl"/>
              <span className="camera-frame-corner br"/>
            </div>
            <div className="camera-hint camera-auto-detect-hint">
              <div className="camera-hint-roller" aria-label="随手一拍，记录生活；拍饮食记热量；拍咖啡记咖啡因；拍奶茶、饮料识别热量">
                <div className="camera-hint-track">
                  <span>随手一拍，记录生活</span>
                  <span>拍饮食记热量</span>
                  <span>拍咖啡记咖啡因</span>
                  <span>拍奶茶、饮料识别热量</span>
                  <span aria-hidden="true">随手一拍，记录生活</span>
                </div>
              </div>
            </div>
          </>
        )}
        {flash && <div className="camera-flash" />}
      </div>

      {showPhotoPermDialog && (
        <PhotoLibraryPermissionDialog
          onAllowFull={onPhotoPermAllowFull}
          onLimit={onPhotoPermLimit}
          onDeny={onPhotoPermDeny}
        />
      )}

      {showGallery && (
        <PhotoPickerSheet
          onSelect={onSelectPhoto}
          onClose={onCloseGallery}
          preferredMode={preferredRecognitionMode}
        />
      )}

      <div className="camera-bottom-bar">
        {showAnalyze ? (
          recognitionResult ? (
            <CameraRecognitionResult
              result={recognitionResult}
              onChange={onRecognitionChange}
              onRetake={onAnalyzeRetake}
              onSave={onRecognitionSave}
            />
          ) : (
            <CameraCaptureAnalyzePanel
              phase={analyzePhase}
              progress={analyzeProgress}
              analyzeMode={analyzeMode}
              errorKind={analyzeErrorKind}
              onRetry={onAnalyzeRetry}
              onRetake={onAnalyzeRetake}
              showRetry={analyzeFailureCount < analyzeMaxFailures}
              isExhausted={analyzeExhausted}
            />
          )
        ) : (
          <>
            <div className="camera-controls">
              {!showGallery && (
                <button
                  type="button"
                  className="camera-gallery-btn"
                  onClick={onOpenGallery}
                  aria-label="相册"
                >
                  <I name="image" size={24} stroke={1.5} />
                </button>
              )}
              {!permDenied && (
                <button
                  type="button"
                  className={'camera-shutter' + (permPending ? ' is-disabled' : '')}
                  onClick={handleCapture}
                  aria-label="拍照并自动识别记录类型"
                  disabled={permPending}
                >
                  <span className="camera-shutter-ring"/>
                  <span className="camera-shutter-inner"/>
                </button>
              )}
              {!showGallery && (
                <span className="camera-controls-side" aria-hidden="true"/>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function CameraTransition({ 
  active, 
  sourceRect, 
  cardContent,
  containerRef,
  onCaptureSuccess,
  onClose,
  onSelectPhoto,
  onActiveChange,
  preferredRecognitionMode = null,
}) {
  const [phase, setPhase] = React.useState('idle');
  const [showGallery, setShowGallery] = React.useState(false);
  const [permScenario, setPermScenario] = React.useState(() => readCameraPermissionScenario());
  const [sessionGranted, setSessionGranted] = React.useState(false);
  const [sessionDenied, setSessionDenied] = React.useState(false);
  const [photoPermGranted, setPhotoPermGranted] = React.useState(false);
  const [showPhotoPermDialog, setShowPhotoPermDialog] = React.useState(false);
  const [recognitionResult, setRecognitionResult] = React.useState(null);
  const wrapperRef = React.useRef(null);
  const beverageLabelRetakeRef = React.useRef(false);

  const containerSize = React.useMemo(() => {
    const el = containerRef?.current;
    if (!el) return { width: 402, height: 742 };
    const body = el.querySelector?.('.phone-body') || el;
    return {
      width: body.offsetWidth || el.offsetWidth,
      height: body.offsetHeight || el.offsetHeight,
    };
  }, [containerRef, active]);

  React.useLayoutEffect(() => {
    if (active && sourceRect && phase === 'idle') {
      setPhase('initial');
      setShowGallery(false);
      setPermScenario(readCameraPermissionScenario());
      setSessionGranted(false);
      setSessionDenied(false);
      setPhotoPermGranted(false);
      setShowPhotoPermDialog(false);
      setRecognitionResult(null);
      beverageLabelRetakeRef.current = false;
    }
  }, [active, sourceRect, phase]);

  React.useEffect(() => {
    const onScenarioChange = () => {
      setPermScenario(readCameraPermissionScenario());
      setSessionGranted(false);
      setSessionDenied(false);
      setPhotoPermGranted(false);
      setShowPhotoPermDialog(false);
      setRecognitionResult(null);
      beverageLabelRetakeRef.current = false;
    };
    window.addEventListener('cameraPermissionScenarioChange', onScenarioChange);
    return () => window.removeEventListener('cameraPermissionScenarioChange', onScenarioChange);
  }, []);
  
  React.useEffect(() => {
    if (phase === 'initial') {
      const timer = setTimeout(() => {
        setPhase('animating');
        setTimeout(() => {
          setPhase('complete');
        }, TRANSITION_DURATION);
      }, 20);
      return () => clearTimeout(timer);
    }
    
    if (!active && phase === 'complete') {
      setPhase('closing');
    }
    
    if (phase === 'closing') {
      const timer = setTimeout(() => {
        setPhase('idle');
        setShowGallery(false);
      }, TRANSITION_DURATION);
      return () => clearTimeout(timer);
    }
  }, [active, phase]);

  React.useEffect(() => {
    onActiveChange?.(phase !== 'idle');
  }, [phase, onActiveChange]);

  const mounted = phase !== 'idle';
  const isInitialPosition = phase === 'initial' || phase === 'closing';
  const showCamera = phase === 'animating' || phase === 'complete';
  const showPermissionDialog = showCamera
    && !showGallery
    && permScenario === 'unauthorized'
    && !sessionGranted
    && !sessionDenied;
  const showPermissionBlocked = showCamera
    && !showGallery
    && permScenario === 'unauthorized'
    && !sessionGranted
    && sessionDenied;

  const handlePermissionAllow = () => {
    setSessionGranted(true);
    setSessionDenied(false);
  };

  const handlePermissionDeny = () => {
    setSessionDenied(true);
  };

  const handlePermissionEnable = () => {
    setSessionGranted(true);
    setSessionDenied(false);
  };
  
  const handleOpenGallery = () => {
    if (photoPermGranted) {
      setShowGallery(true);
      return;
    }
    setShowPhotoPermDialog(true);
  };

  const handlePhotoPermAllowFull = () => {
    setPhotoPermGranted(true);
    setShowPhotoPermDialog(false);
    setShowGallery(true);
  };

  const handlePhotoPermLimit = () => {
    setShowPhotoPermDialog(false);
  };

  const handlePhotoPermDeny = () => {
    setShowPhotoPermDialog(false);
  };
  
  const handleCloseGallery = () => {
    setShowGallery(false);
  };

  const handleAnalyzeSuccess = React.useCallback((payload) => {
    const result = buildCameraRecognitionResult(payload);
    if (['photo', 'beverage'].includes(result.mode)) {
      onCaptureSuccess?.({
        ...result,
        recognitionState: 'ready',
      });
      onClose?.();
      return;
    }
    setRecognitionResult(result);
  }, [onCaptureSuccess, onClose]);

  const analyze = useCameraPhotoAnalyze({ onSuccess: handleAnalyzeSuccess });

  React.useEffect(() => {
    if (active) return;
    setRecognitionResult(null);
    beverageLabelRetakeRef.current = false;
    analyze.reset();
  }, [active, analyze.reset]);

  const handleCameraClose = () => {
    if (showGallery) {
      handleCloseGallery();
      return;
    }
    setRecognitionResult(null);
    beverageLabelRetakeRef.current = false;
    analyze.reset();
    onClose?.();
  };

  const resolveBeverageRetakePhoto = (photo) => {
    if (!beverageLabelRetakeRef.current) return photo;
    beverageLabelRetakeRef.current = false;
    const isNoLabelPhoto = photo?.recognitionVariant === 'coffee-no-label'
      || photo?.thumb === 'image/咖啡无标签图.jpg'
      || photo?.url === 'image/咖啡无标签图.jpg';
    if (!isNoLabelPhoto) return photo;
    return {
      ...photo,
      id: `${photo?.id || 'beverage-coffee-no-label'}-fallback`,
      mode: 'beverage',
      type: 'beverage',
      recognitionVariant: 'coffee-no-label-fallback',
    };
  };

  const handleCapturePhoto = () => {
    const preferredConfig = preferredRecognitionMode
      ? CAMERA_RECOGNITION_MODE_MAP[preferredRecognitionMode]
      : null;
    const selectedPhoto = preferredRecognitionMode === 'beverage'
      ? getNextBeverageOcrDemoPhoto()
      : preferredRecognitionMode === 'diet'
      ? getNextDietDemoPhoto()
      : preferredConfig
      ? {
          id: `preferred-${preferredConfig.id}`,
          thumb: preferredConfig.capturePhoto,
          type: preferredConfig.id,
          mode: preferredConfig.id,
        }
      : getNextAutoDetectDemoPhoto();
    const photo = resolveBeverageRetakePhoto(selectedPhoto);
    const recognitionMode = preferredRecognitionMode || inferCameraRecognitionMode(photo);
    analyze.runAnalyze({
      url: photo.thumb,
      meta: { type: 'capture', photo, mode: recognitionMode },
    });
  };
  
  const handleSelectPhoto = (photo) => {
    setShowGallery(false);
    const selectedPhoto = preferredRecognitionMode === 'diet'
      ? { ...resolveBeverageRetakePhoto(photo), type: 'diet', mode: 'diet' }
      : resolveBeverageRetakePhoto(photo);
    const photoUrl = selectedPhoto?.thumb || selectedPhoto?.url || window.pickFallbackPhoto?.() || null;
    const recognitionMode = preferredRecognitionMode || inferCameraRecognitionMode(selectedPhoto);
    analyze.runAnalyze({
      url: photoUrl,
      meta: {
        type: 'select',
        photo: selectedPhoto,
        mode: recognitionMode,
      },
    });
  };

  const handleAnalyzeRetake = () => {
    if (analyze.errorKind === 'beverage-no-label') {
      beverageLabelRetakeRef.current = true;
    }
    setRecognitionResult(null);
    analyze.handleRetake();
  };

  const handleRecognitionSave = () => {
    const isNumeric = recognitionResult?.mode === 'weight';
    if (!recognitionResult || (isNumeric && Number(recognitionResult.value) <= 0)) return;
    onCaptureSuccess?.({
      ...recognitionResult,
      value: isNumeric ? Number(recognitionResult.value) : recognitionResult.value,
      recognitionState: 'ready',
    });
    setRecognitionResult(null);
    analyze.reset();
    onClose?.();
  };

  if (!mounted || !sourceRect) return null;

  const rect = sourceRect;
  
  // 使用 absolute 定位，相对于 .phone 容器
  const wrapperStyle = isInitialPosition ? {
    position: 'absolute',
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
    borderRadius: 12,
  } : {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    borderRadius: 0,
  };
  
  const innerOffset = isInitialPosition ? {
    x: -rect.left,
    y: -rect.top,
  } : {
    x: 0,
    y: 0,
  };

  const isFullScreen = phase === 'animating' || phase === 'complete';

  const content = (
    <div 
      ref={wrapperRef}
      className={'camera-transition-wrapper phase-' + phase}
      style={{
        ...wrapperStyle,
        overflow: 'hidden',
        zIndex: 9999,
        background: '#000',
        transition: phase === 'animating' || phase === 'closing' || phase === 'closed' 
          ? `left ${TRANSITION_DURATION}ms ${TRANSITION_EASING}, 
             top ${TRANSITION_DURATION}ms ${TRANSITION_EASING}, 
             width ${TRANSITION_DURATION}ms ${TRANSITION_EASING}, 
             height ${TRANSITION_DURATION}ms ${TRANSITION_EASING}, 
             border-radius ${TRANSITION_DURATION}ms ${TRANSITION_EASING}` 
          : 'none',
      }}
    >
      <div 
        className="camera-transition-inner"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: isFullScreen ? '100%' : containerSize.width,
          height: isFullScreen ? '100%' : containerSize.height,
          transform: `translate(${innerOffset.x}px, ${innerOffset.y}px)`,
          transition: phase === 'animating' || phase === 'closing' || phase === 'closed'
            ? `transform ${TRANSITION_DURATION}ms ${TRANSITION_EASING}` 
            : 'none',
        }}
      >
        <CameraView 
            onCapture={handleCapturePhoto} 
            onClose={handleCameraClose}
            onOpenGallery={handleOpenGallery}
            visible={showCamera}
            permPending={showPermissionDialog}
            permDenied={showPermissionBlocked}
            showPhotoPermDialog={showPhotoPermDialog}
            showGallery={showGallery}
            onCloseGallery={handleCloseGallery}
            onSelectPhoto={handleSelectPhoto}
            onPermissionAllow={handlePermissionAllow}
            onPermissionDeny={handlePermissionDeny}
            onPermissionEnable={handlePermissionEnable}
            onPhotoPermAllowFull={handlePhotoPermAllowFull}
            onPhotoPermLimit={handlePhotoPermLimit}
            onPhotoPermDeny={handlePhotoPermDeny}
            analyzePhase={analyze.phase}
            capturedPhotoUrl={analyze.photoUrl}
            analyzeProgress={analyze.progress}
            analyzeFailureCount={analyze.failureCount}
            analyzeMaxFailures={analyze.maxFailures}
            analyzeExhausted={analyze.isExhausted}
            analyzeErrorKind={analyze.errorKind}
            analyzeMode={analyze.analyzeMode}
            onAnalyzeRetry={analyze.handleRetry}
            onAnalyzeRetake={handleAnalyzeRetake}
            recognitionResult={recognitionResult}
            onRecognitionChange={setRecognitionResult}
            onRecognitionSave={handleRecognitionSave}
            preferredRecognitionMode={preferredRecognitionMode}
          />
      </div>
      
      <div 
        className="camera-transition-overlay"
        style={{
          position: 'absolute',
          inset: 0,
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          padding: '0 20px 0 16px',
          gap: 10,
          borderRadius: 'inherit',
          opacity: isInitialPosition ? 1 : 0,
          transition: `opacity ${OVERLAY_FADE_DURATION}ms ${TRANSITION_EASING}`,
          pointerEvents: 'none',
        }}
      >
        {cardContent}
      </div>
    </div>
  );

  const portalTarget = containerRef?.current?.closest?.('.phone') || containerRef?.current;
  if (portalTarget && window.ReactDOM?.createPortal) {
    return window.ReactDOM.createPortal(content, portalTarget);
  }
  return content;
}

function CameraPermissionScenarioBar() {
  const [value, setValue] = React.useState(() => readCameraPermissionScenario());

  React.useEffect(() => {
    const onChange = () => setValue(readCameraPermissionScenario());
    window.addEventListener('cameraPermissionScenarioChange', onChange);
    return () => window.removeEventListener('cameraPermissionScenarioChange', onChange);
  }, []);

  const handleChange = (next) => {
    writeCameraPermissionScenario(next);
    setValue(next);
  };

  return (
    <div className="demo-scene-dock" role="toolbar" aria-label="相机权限场景切换">
      <div className="demo-scene-dock-label">相机权限</div>
      <div className="demo-scene-dock-options">
        {CAMERA_PERMISSION_SCENARIOS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={'demo-scene-dock-btn' + (value === opt.value ? ' active' : '')}
            aria-pressed={value === opt.value}
            onClick={() => handleChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <p className="demo-scene-dock-hint">
        {{
          unauthorized: '未授权：每次进入智能相机都会先弹出权限弹窗；点「不允许」后显示权限引导页',
          authorized: '已授权：进入智能相机不再弹出权限弹窗',
        }[value] || ''}
      </p>
    </div>
  );
}

Object.assign(window, {
  CameraView,
  CameraTransition,
  PhotoPicker,
  PhotoPickerSheet,
  CameraPermissionDialog,
  CameraPermissionBlocked,
  PhotoLibraryPermissionDialog,
  CameraPermissionScenarioBar,
  measureElementRect,
  readCameraPermissionScenario,
  writeCameraPermissionScenario,
  isCameraPermissionScenario,
  isDietTextRecordScenario,
  CAMERA_PERMISSION_SCENARIOS,
});
