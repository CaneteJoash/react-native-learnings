import { useEffect } from 'react';
import { ActionSheetIOS } from 'react-native';

import type { ConfirmSheetProps } from './confirm-sheet.types';

export function ConfirmSheetSplit({ visible, title, message, options, cancelLabel = 'Cancel', onSelect, onCancel }: ConfirmSheetProps) {
  useEffect(() => {
    if (!visible) return;

    const destructiveButtonIndex = options.findIndex((o) => o.destructive);
    const buttons = [...options.map((o) => o.label), cancelLabel];
    const cancelButtonIndex = buttons.length - 1;

    ActionSheetIOS.showActionSheetWithOptions(
      {
        title,
        message,
        options: buttons,
        cancelButtonIndex,
        ...(destructiveButtonIndex >= 0 ? { destructiveButtonIndex } : {}),
      },
      (index) => (index === cancelButtonIndex ? onCancel() : onSelect(index))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return null;
}
