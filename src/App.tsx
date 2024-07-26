import * as React from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { css, Fab, LinearProgress } from '@mui/material';
import { Folder } from '@mui/icons-material';
import Viewer from './Viewer';

function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light',
        },
      }),
    [prefersDarkMode],
  );

  const [handle, setHandle] = React.useState<FileSystemDirectoryHandle | null>(null);
  const isVsCode = navigator.userAgent.includes('Electron/');

  const chooseDir = () => {
    window
      .showDirectoryPicker({
        id: 'visual-file',
      })
      .then((handle) => setHandle(handle));
  };

  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { command, data } = event.data;
      if (command === 'load-dir-result') {
        setHandle(data);
      }
    };

    if (isVsCode) {
      window.parent.postMessage(
        {
          isFromApp: true,
          command: 'load-dir',
        },
        '*',
      );
      window.addEventListener('message', handleMessage);
    }

    return () => {
      if (isVsCode) {
        window.removeEventListener('message', handleMessage);
      }
    };
  }, [isVsCode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div
        css={css`
          width: 100vw;
          height: 100vh;
          font-family: Roboto, system-ui, sans-serif;
        `}
      >
        {!isVsCode && (
          <Fab
            color="primary"
            css={css`
              position: fixed;
              z-index: 1000;
              right: 3rem;
              bottom: 3rem;
            `}
            onClick={chooseDir}
          >
            <Folder />
          </Fab>
        )}
        {isVsCode && !handle && <LinearProgress />}
        {handle && <Viewer handle={handle} />}
      </div>
    </ThemeProvider>
  );
}

export default App;
