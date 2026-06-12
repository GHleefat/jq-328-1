import { ColorMatrix, ColorblindType, ColorblindOption } from '@/types';

export const COLOR_MATRICES: Record<Exclude<ColorblindType, 'normal'>, ColorMatrix> = {
  protanopia: [
    [0.567, 0.433, 0],
    [0.558, 0.442, 0],
    [0, 0.242, 0.758],
  ],
  deuteranopia: [
    [0.625, 0.375, 0],
    [0.7, 0.3, 0],
    [0, 0.3, 0.7],
  ],
  tritanopia: [
    [0.95, 0.05, 0],
    [0, 0.433, 0.567],
    [0, 0.475, 0.525],
  ],
  achromatopsia: [
    [0.299, 0.587, 0.114],
    [0.299, 0.587, 0.114],
    [0.299, 0.587, 0.114],
  ],
  protanomaly: [
    [0.817, 0.183, 0],
    [0.333, 0.667, 0],
    [0, 0.125, 0.875],
  ],
  deuteranomaly: [
    [0.8, 0.2, 0],
    [0.258, 0.742, 0],
    [0, 0.142, 0.858],
  ],
};

export const COLORBLIND_OPTIONS: ColorblindOption[] = [
  {
    value: 'normal',
    label: '正常视觉',
    description: '显示原始图片，无颜色转换',
    prevalence: '—',
  },
  {
    value: 'protanopia',
    label: '红色盲 (Protanopia)',
    description: '红色视锥细胞缺失，难以区分红色和绿色',
    prevalence: '男性 ~1%',
  },
  {
    value: 'deuteranopia',
    label: '绿色盲 (Deuteranopia)',
    description: '绿色视锥细胞缺失，最常见的色盲类型',
    prevalence: '男性 ~1%',
  },
  {
    value: 'tritanopia',
    label: '蓝黄色盲 (Tritanopia)',
 description: '蓝色视锥细胞缺失，难以区分蓝色和黄色',
    prevalence: '约 0.003%',
  },
  {
    value: 'achromatopsia',
    label: '全色盲 (Achromatopsia)',
    description: '完全不能感知颜色，只能看到灰度',
    prevalence: '约 0.00003%',
  },
  {
    value: 'protanomaly',
    label: '红色弱 (Protanomaly)',
    description: '红色视锥细胞异常，红色感知减弱',
    prevalence: '男性 ~1%',
  },
  {
    value: 'deuteranomaly',
    label: '绿色弱 (Deuteranomaly)',
    description: '绿色视锥细胞异常，绿色感知减弱',
    prevalence: '男性 ~5%',
  },
];

export function applyColorMatrix(
  r: number,
  g: number,
  b: number,
  matrix: ColorMatrix
): [number, number, number] {
  const newR = matrix[0][0] * r + matrix[0][1] * g + matrix[0][2] * b;
  const newG = matrix[1][0] * r + matrix[1][1] * g + matrix[1][2] * b;
  const newB = matrix[2][0] * r + matrix[2][1] * g + matrix[2][2] * b;
  
  return [
    Math.min(255, Math.max(0, Math.round(newR))),
    Math.min(255, Math.max(0, Math.round(newG))),
    Math.min(255, Math.max(0, Math.round(newB))),
  ];
}

export function processImageData(
  imageData: ImageData,
  colorblindType: ColorblindType
): ImageData {
  if (colorblindType === 'normal') {
    return new ImageData(
      new Uint8ClampedArray(imageData.data),
      imageData.width,
      imageData.height
    );
  }

  const matrix = COLOR_MATRICES[colorblindType];
  const data = new Uint8ClampedArray(imageData.data);
  const length = data.length;

  for (let i = 0; i < length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    const [newR, newG, newB] = applyColorMatrix(r, g, b, matrix);
    
    data[i] = newR;
    data[i + 1] = newG;
    data[i + 2] = newB;
  }

  return new ImageData(data, imageData.width, imageData.height);
}
