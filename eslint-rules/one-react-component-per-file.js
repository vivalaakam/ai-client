const COMPONENT_NAME_PATTERN = /^[A-Z][A-Za-z0-9]*$/;

function isComponentName(name) {
  return COMPONENT_NAME_PATTERN.test(name);
}

function isNode(value) {
  return Boolean(value && typeof value === 'object' && typeof value.type === 'string');
}

function containsJsx(node) {
  if (!isNode(node)) return false;
  if (node.type === 'JSXElement' || node.type === 'JSXFragment') return true;

  for (const [key, value] of Object.entries(node)) {
    if (key === 'parent' || key === 'loc' || key === 'range' || key === 'tokens') continue;
    if (Array.isArray(value) && value.some((item) => containsJsx(item))) return true;
    if (containsJsx(value)) return true;
  }

  return false;
}

function isReactFcType(typeAnnotation) {
  const annotation = typeAnnotation?.typeAnnotation;
  const typeName = annotation?.typeName;
  return (
    annotation?.type === 'TSTypeReference' &&
    typeName?.type === 'TSQualifiedName' &&
    typeName.left?.name === 'React' &&
    (typeName.right?.name === 'FC' || typeName.right?.name === 'FunctionComponent')
  );
}

function getComponentName(statement) {
  if (statement.type === 'FunctionDeclaration') {
    const name = statement.id?.name;
    return name && isComponentName(name) && containsJsx(statement.body) ? name : null;
  }

  if (statement.type !== 'VariableDeclaration') return null;
  for (const declaration of statement.declarations) {
    const name = declaration.id?.name;
    if (!name || !isComponentName(name)) continue;
    const initIsFunction =
      declaration.init?.type === 'ArrowFunctionExpression' ||
      declaration.init?.type === 'FunctionExpression';
    if (
      (initIsFunction && containsJsx(declaration.init.body)) ||
      isReactFcType(declaration.id.typeAnnotation)
    ) {
      return name;
    }
  }

  return null;
}

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Allow only one top-level React component per file',
    },
    schema: [],
  },
  create(context) {
    return {
      Program(node) {
        const filename = context.filename ?? context.getFilename?.() ?? '';
        if (!filename.endsWith('.tsx')) return;

        const components = node.body.map(getComponentName).filter(Boolean);
        if (components.length <= 1) return;

        context.report({
          node,
          message: `Only one React component is allowed per file. Found: ${components.join(', ')}.`,
        });
      },
    };
  },
};
