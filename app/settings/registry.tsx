'use client';

import React, { useState } from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import {
  createCache,
  extractStyle,
  StyleProvider
} from '@ant-design/cssinjs'

const AntdProvider: React.FunctionComponent<React.PropsWithChildren> = ({children}) => {
  const [cache] = useState(() => createCache());

  useServerInsertedHTML(() => {
      return (
          <script dangerouslySetInnerHTML={{
              __html: `</script>${extractStyle(cache)}<script>`
          }}/>
      )
  });

  if (typeof window !== 'undefined') return <>{children}</>;

  return <StyleProvider cache={cache}>{children}</StyleProvider>;
}

export default AntdProvider;

// export default function StyledComponentsRegistry({
//   children
// }: {
//   children: React.ReactNode;
// }) {
//   // Only create stylesheet once with lazy initial state
//   // x-ref: https://reactjs.org/docs/hooks-reference.html#lazy-initial-state
//   const [styledComponentsStyleSheet] = useState(() => new ServerStyleSheet());

//   useServerInsertedHTML(() => {
//     const styles = styledComponentsStyleSheet.getStyleElement();
//     styledComponentsStyleSheet.instance.clearTag();
//     return <>{styles}</>;
//   });

//   if (typeof window !== 'undefined') return <>{children}</>;

//   return (
//     <StyleSheetManager sheet={styledComponentsStyleSheet.instance}>
//       {children}
//     </StyleSheetManager>
//   );
// }