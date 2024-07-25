import * as React from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { css, Fab } from '@mui/material';
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

  const chooseDir = () => {
    window
      .showDirectoryPicker({
        id: 'visual-file',
      })
      .then((handle) => setHandle(handle));
  };

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
        {handle && <Viewer handle={handle} />}
      </div>
    </ThemeProvider>
  );
}

export default App;
