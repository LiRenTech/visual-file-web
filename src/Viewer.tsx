import { Folder, FolderOpen, InsertDriveFile } from '@mui/icons-material';
import { css, Paper } from '@mui/material';
import { useEffect, useState } from 'react';

type SimpleHandle = { kind: 'file'; name: string; size: number } | { kind: 'directory'; name: string; children: SimpleHandle[] };

function formatFileSize(bytes: number) {
  const thresh = 1000;

  if (Math.abs(bytes) < thresh) {
    return bytes + ' B';
  }

  const units = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  let u = -1;
  const dp = 2;
  const r = 10 ** dp;

  do {
    bytes /= thresh;
    ++u;
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);

  return bytes.toFixed(dp) + ' ' + units[u];
}
function getColorBySize(size: number) {
  // 最大文件大小，对应红色
  const maxSize = 10000000;
  // 白色和红色的RGB值
  const min = { r: 0, g: 255, b: 0 };
  const max = { r: 200, g: 200, b: 0 };

  // 计算文件大小在最小和最大值之间的比例
  const ratio = Math.min(1, size / maxSize);

  // 使用线性插值计算每个颜色通道的值
  const r = Math.round(min.r + ratio * (max.r - min.r));
  const g = Math.round(min.g + ratio * (max.g - min.g));
  const b = Math.round(min.b + ratio * (max.b - min.b));

  // 将RGB值转换为十六进制颜色代码
  const toHex = (n: number) => {
    n = Math.min(255, Math.round(n));
    const hex = n.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function Viewer({ handle, elevation = 1 }: { handle: FileSystemDirectoryHandle | SimpleHandle; elevation?: number }) {
  const loadDir = async (handle: FileSystemDirectoryHandle) => {
    // 递归整个目录
    const result: SimpleHandle[] = [];
    for await (const entry of handle.values()) {
      if (entry.kind === 'directory') {
        result.push({ kind: 'directory', name: entry.name, children: await loadDir(entry) });
      } else {
        result.push({ kind: 'file', name: entry.name, size: (await entry.getFile()).size });
      }
    }
    return result;
  };

  const [data, setData] = useState<SimpleHandle | null>(null);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    let active = true;
    load();
    return () => {
      active = false;
    };
    async function load() {
      setData(null);
      let res: SimpleHandle;
      if ('entries' in handle) {
        res = { kind: 'directory', name: handle.name, children: await loadDir(handle) };
      } else {
        res = handle;
      }
      if (!active) {
        return;
      }
      setData(res);
    }
  }, [handle]);

  return (
    data && (
      <Paper
        elevation={elevation}
        css={css`
          display: flex;
          flex-wrap: wrap;
          flex-direction: column;
          gap: 16px;
          padding: 16px;
          max-width: 100%;
          cursor: pointer;
        `}
        style={{
          color: data.kind === 'directory' ? '#aaa' : getColorBySize(data.size),
          backgroundColor: `rgb(${0}, ${elevation * 10 + 10}, ${100})`,
        }}
        onClick={(e) => {
          e.stopPropagation();
          setExpanded(!expanded);
        }}
      >
        {data.kind === 'directory' ? (
          <>
            <span
              css={css`
                display: flex;
                align-items: center;
                gap: 8px;
              `}
            >
              {expanded ? <FolderOpen /> : <Folder />}
              {data.name}
            </span>
            {expanded && (
              <div
                css={css`
                  display: flex;
                  max-width: 100%;
                  flex-wrap: wrap;
                  gap: 15px;
                `}
              >
                {data.children.map((child) => (
                  <Viewer handle={child} elevation={elevation + 1} />
                ))}
              </div>
            )}
          </>
        ) : (
          <span
            css={css`
              display: flex;
              align-items: center;
              gap: 8px;
            `}
          >
            <InsertDriveFile />
            {data.name} ({formatFileSize(data.size)})
          </span>
        )}
      </Paper>
    )
  );
}

export default Viewer;
