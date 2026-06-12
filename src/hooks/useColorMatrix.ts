import { useMemo } from 'react';
import { ColorblindType, ColorMatrix } from '@/types';
import { COLOR_MATRICES, COLORBLIND_OPTIONS } from '@/utils/colorMatrix';

export function useColorMatrix() {
  const getMatrix = useMemo(
    () => (type: ColorblindType): ColorMatrix | null => {
      if (type === 'normal') return null;
      return COLOR_MATRICES[type];
    },
    []
  );

  const getOption = useMemo(
    () => (type: ColorblindType) => {
      return COLORBLIND_OPTIONS.find(opt => opt.value === type);
    },
    []
  );

  const getAllOptions = useMemo(() => COLORBLIND_OPTIONS, []);

  return {
    getMatrix,
    getOption,
    getAllOptions,
  };
}
