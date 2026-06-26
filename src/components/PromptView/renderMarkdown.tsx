export function renderMarkdown(content: string) {
  const lines = content.split('\n');
  const nodes: JSX.Element[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];
  let code: string[] | null = null;

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    nodes.push(<p key={`p-${nodes.length}`}>{paragraph.join('\n')}</p>);
    paragraph = [];
  };
  const flushList = () => {
    if (list.length === 0) return;
    nodes.push(
      <ul key={`ul-${nodes.length}`}>
        {list.map((item, index) => (
          <li key={`${item}-${index}`}>{item}</li>
        ))}
      </ul>
    );
    list = [];
  };

  for (const line of lines) {
    if (line.startsWith('```')) {
      if (code) {
        nodes.push(<pre key={`code-${nodes.length}`}>{code.join('\n')}</pre>);
        code = null;
      } else {
        flushParagraph();
        flushList();
        code = [];
      }
      continue;
    }
    if (code) {
      code.push(line);
      continue;
    }
    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }
    const heading = /^(#{1,3})\s+(.+)$/.exec(line);
    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length;
      const text = heading[2];
      nodes.push(
        level === 1 ? (
          <h1 key={`h-${nodes.length}`}>{text}</h1>
        ) : level === 2 ? (
          <h2 key={`h-${nodes.length}`}>{text}</h2>
        ) : (
          <h3 key={`h-${nodes.length}`}>{text}</h3>
        )
      );
      continue;
    }
    const item = /^[-*]\s+(.+)$/.exec(line);
    if (item) {
      flushParagraph();
      list.push(item[1]);
      continue;
    }
    paragraph.push(line);
  }

  flushParagraph();
  flushList();
  if (code) nodes.push(<pre key={`code-${nodes.length}`}>{code.join('\n')}</pre>);
  return nodes.length > 0 ? nodes : <p className="markdown-empty">Nothing to preview</p>;
}
