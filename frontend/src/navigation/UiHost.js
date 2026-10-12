/**
 * UiHost — renders app-global overlays (loading overlay, toast) driven by the
 * ui slice, so any screen can surface them via dispatch without owning the UI.
 */
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { LoadingOverlay, Toast } from '../components';
import { clearToast } from '../redux';
import { strings } from '../localization';

function UiHost() {
  const dispatch = useDispatch();
  const overlayVisible = useSelector((s) => s.ui.overlayVisible);
  const overlayMessage = useSelector((s) => s.ui.overlayMessage);
  const toast = useSelector((s) => s.ui.toast);

  return (
    <>
      <LoadingOverlay visible={overlayVisible} message={overlayMessage || strings.common.loading} />
      <Toast
        visible={Boolean(toast)}
        severity={toast?.severity}
        message={toast?.message}
        onDismiss={() => dispatch(clearToast())}
      />
    </>
  );
}

export default UiHost;
