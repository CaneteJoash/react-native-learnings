export type ConfirmSheetOption = {
  label: string;
  destructive?: boolean;
};

export type ConfirmSheetProps = {
  visible: boolean;
  title: string;
  message?: string;
  options: ConfirmSheetOption[];
  cancelLabel?: string;
  onSelect: (index: number) => void;
  onCancel: () => void;
};
