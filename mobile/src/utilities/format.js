export const round = (value) => Number(value || 0).toFixed(1);

export const precise = (value) => Number(value || 0).toFixed(2);

export const badgeStyle = (status, ui) => {
  if (status === 'approved') {
    return { backgroundColor: ui.successSoft, color: ui.success };
  }

  if (status === 'rejected') {
    return { backgroundColor: 'rgba(220, 38, 38, 0.1)', color: ui.danger };
  }

  return { backgroundColor: ui.warningSoft, color: ui.warning };
};
