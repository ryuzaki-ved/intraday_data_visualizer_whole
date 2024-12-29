import React from 'react';
import { FileNode } from '../types';

interface FileTreeProps {
  tree: FileNode[];
  selected: string | null;
  onSelect: (path: string) => void;
}

export const FileTree: React.FC<FileTreeProps> = ({ tree, selected, onSelect }) => {
  const renderNode = (node: FileNode, parentPath = '') => {
    if (node.type === 'folder') {
      return (
        <div key={parentPath + node.name} style={{ marginLeft: 12 }}>
          <div style={{ fontWeight: 600, margin: '6px 0 2px 0' }}>{node.name}</div>
          {node.children && node.children.map(child => renderNode(child, parentPath + node.name + '/'))}
        </div>
      );
    }
    return (
      <div
        key={node.path}
        style={{
          marginLeft: 24,
          padding: '3px 8px',
          borderRadius: 5,
          background: selected === node.path ? '#0066ff' : 'transparent',
          color: selected === node.path ? '#fff' : '#232946',
          cursor: 'pointer',
          fontWeight: selected === node.path ? 700 : 500,
        }}
        onClick={() => onSelect(node.path!)}
      >
        {node.name}
      </div>
    );
  };
  return <div>{tree.map(node => renderNode(node))}</div>;
};