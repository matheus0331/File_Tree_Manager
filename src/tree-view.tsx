"use client";

import React, { useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { File, Folder, X, Pencil, Plus } from "lucide-react";

// Define the structure of a tree node
interface TreeNode {
  id: string;
  name: string;
  type: "file" | "folder";
  children?: TreeNode[];
}

// Sample initial data for both trees
const initialLeftTree: TreeNode[] = [
  {
    id: "rightyAI",
    name: "Righty AI",
    type: "folder",
    children: [
      {
        id: "public",
        name: "Public",
        type: "folder",
        children: [
          { id: "thesis", name: "thesis.pdf", type: "file" },
          { id: "report", name: "research report.pdf", type: "file" },
        ],
      },
      {
        id: "private",
        name: "Private",
        type: "folder",
        children: [
          { id: "thesis1", name: "thesis.pdf", type: "file" },
          { id: "report1", name: "research report.pdf", type: "file" },
        ],
      },
      { id: "integration", name: "integration.pdf", type: "file" },
    ],
  },
];

const initialRightTree: TreeNode[] = [
  {
    id: "myfolder",
    name: "My Folder",
    type: "folder",
    children: [
      {
        id: "cancer",
        name: "Cancer Files",
        type: "folder",
        children: [
          { id: "leuk", name: "leukocytes.png", type: "file" },
          { id: "leukomia", name: "leukomia.txt", type: "file" },
        ],
      },
      {
        id: "images",
        name: "Images",
        type: "folder",
        children: [
          { id: "1", name: "1.png", type: "file" },
          { id: "2", name: "2.png", type: "file" },
        ],
      },
    ],
  },
];

// TreeNode component
const TreeNode: React.FC<{
  node: TreeNode;
  onMove: (draggedNode: TreeNode, targetNode: TreeNode) => void;
  onDelete: (nodeId: string) => void;
  onRename: (nodeId: string, newName: string) => void;
  onNewFile: (parentId: string) => void;
  onNewFolder: (parentId: string) => void;
  path: string[];
}> = ({ node, onMove, onDelete, onRename, onNewFile, onNewFolder, path }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(node.name);

  const [{ isDragging }, drag] = useDrag({
    type: "TREE_NODE",
    item: { node, path },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: "TREE_NODE",
    drop: (item: { node: TreeNode; path: string[] }, monitor) => {
      if (monitor.didDrop()) {
        return;
      }
      if (item.node.id !== node.id) {
        onMove(item.node, node);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  });

  const toggleOpen = () => setIsOpen(!isOpen);

  const handleRename = () => {
    if (editName.trim() !== "") {
      onRename(node.id, editName.trim());
      setIsEditing(false);
    }
  };

  return (
    <div ref={drop} className={`pl-4 ${isOver ? "bg-blue-100" : ""}`}>
      <div
        ref={drag}
        className={`flex justify-between items-center gap-2 hover:bg-[#6c6c6c] p-2 rounded ${
          isDragging ? "opacity-50" : ""
        }`}
      >
        <div
          className="flex gap-2 items-center cursor-pointer"
          onClick={toggleOpen}
        >
          {node.type === "folder" && <span>{isOpen ? "▼" : "►"}</span>}
          {node.type === "folder" ? <Folder size={16} /> : <File size={16} />}
          {isEditing ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleRename}
              onKeyPress={(e) => e.key === "Enter" && handleRename()}
              className="border rounded px-1 text-sm"
              autoFocus
            />
          ) : (
            <span>{node.name}</span>
          )}
        </div>
        <div className="flex gap-1">
          {!isEditing && (
            <button
              className="text-white hover:text-red-500"
              onClick={() => setIsEditing(true)}
            >
              <Pencil size={12} />
            </button>
          )}
          {(node.type === "file" || node.type === "folder") && (
            <button
              className="text-white hover:text-red-500"
              onClick={() => onDelete(node.id)}
            >
              <X size={12} />
            </button>
          )}
          {node.type === "folder" && (
            <>
              <button
                className="text-white hover:text-red-500"
                onClick={() => onNewFile(node.id)}
              >
                <Plus size={12} />
              </button>
              <button
                className="text-white hover:text-red-500"
                onClick={() => onNewFolder(node.id)}
              >
                <Folder size={12} />
              </button>
            </>
          )}
        </div>
      </div>
      {node.type === "folder" && isOpen && node.children && (
        <div className="pl-4">
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              onMove={onMove}
              onDelete={onDelete}
              onRename={onRename}
              onNewFile={onNewFile}
              onNewFolder={onNewFolder}
              path={[...path, node.id]}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Main component
export default function TreeViewDragDrop() {
  const [leftTree, setLeftTree] = useState<TreeNode[]>(initialLeftTree);
  const [rightTree, setRightTree] = useState<TreeNode[]>(initialRightTree);

  const moveNode = (
    draggedNode: TreeNode,
    targetNode: TreeNode,
    isLeftToRight: boolean
  ) => {
    if (targetNode.type === "file") return;
    const sourceTree = isLeftToRight ? leftTree : rightTree;
    const targetTree = isLeftToRight ? rightTree : leftTree;

    const removeNode = (nodes: TreeNode[]): [TreeNode[], TreeNode | null] => {
      let removedNode: TreeNode | null = null;
      const newNodes = nodes.filter((node) => {
        if (node.id === draggedNode.id) {
          removedNode = node;
          return false;
        }
        if (node.children) {
          const [newChildren, removed] = removeNode(node.children);
          node.children = newChildren;
          if (removed) removedNode = removed;
        }
        return true;
      });
      return [newNodes, removedNode];
    };

    const addNode = (
      nodes: TreeNode[],
      targetId: string,
      nodeToAdd: TreeNode
    ): TreeNode[] => {
      return nodes.map((node) => {
        if (node.id === targetId && node.type === "folder") {
          return {
            ...node,
            children: [...(node.children || []), nodeToAdd],
          };
        }
        if (node.children) {
          return {
            ...node,
            children: addNode(node.children, targetId, nodeToAdd),
          };
        }
        return node;
      });
    };

    const [newSourceTree, removedNode] = removeNode(sourceTree);
    if (removedNode) {
      const newTargetTree = addNode(targetTree, targetNode.id, removedNode);

      if (isLeftToRight) {
        setLeftTree(newSourceTree);
        setRightTree(newTargetTree);
      } else {
        setLeftTree(newTargetTree);
        setRightTree(newSourceTree);
      }
    }
  };

  const deleteNode = (nodeId: string, isLeft: boolean) => {
    const deleteFromTree = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.filter((node) => {
        if (node.id === nodeId) {
          return false;
        }
        if (node.children) {
          node.children = deleteFromTree(node.children);
        }
        return true;
      });
    };

    if (isLeft) {
      setLeftTree(deleteFromTree(leftTree));
    } else {
      setRightTree(deleteFromTree(rightTree));
    }
  };

  const renameNode = (nodeId: string, newName: string, isLeft: boolean) => {
    const renameInTree = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.map((node) => {
        if (node.id === nodeId) {
          return { ...node, name: newName };
        }
        if (node.children) {
          return { ...node, children: renameInTree(node.children) };
        }
        return node;
      });
    };

    if (isLeft) {
      setLeftTree(renameInTree(leftTree));
    } else {
      setRightTree(renameInTree(rightTree));
    }
  };

  const createNewFile = (parentId: string, isLeft: boolean) => {
    const newFile: TreeNode = {
      id: `file${Date.now()}`,
      name: "New File.txt",
      type: "file",
    };

    const addNewFile = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.map((node) => {
        if (node.id === parentId) {
          return {
            ...node,
            children: [...(node.children || []), newFile],
          };
        }
        if (node.children) {
          return { ...node, children: addNewFile(node.children) };
        }
        return node;
      });
    };

    if (isLeft) {
      setLeftTree(addNewFile(leftTree));
    } else {
      setRightTree(addNewFile(rightTree));
    }
  };

  const createNewFolder = (parentId: string, isLeft: boolean) => {
    const newFolder: TreeNode = {
      id: `folder${Date.now()}`,
      name: "New Folder",
      type: "folder",
      children: [],
    };

    const addNewFolder = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.map((node) => {
        if (node.id === parentId) {
          return {
            ...node,
            children: [...(node.children || []), newFolder],
          };
        }
        if (node.children) {
          return { ...node, children: addNewFolder(node.children) };
        }
        return node;
      });
    };

    if (isLeft) {
      setLeftTree(addNewFolder(leftTree));
    } else {
      setRightTree(addNewFolder(rightTree));
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col md:flex-row gap-4 justify-between p-4 md:min-h-[100vh]">
        <div className="md:w-1/2 w-full bg-[#242424] p-4">
          <h2 className="text-lg font-bold mb-2">Left Tree</h2>
          {leftTree.map((node) => (
            <TreeNode
              key={node.id}
              node={node}
              onMove={(draggedNode, targetNode) =>
                moveNode(draggedNode, targetNode, false)
              }
              onDelete={(nodeId) => deleteNode(nodeId, true)}
              onRename={(nodeId, newName) => renameNode(nodeId, newName, true)}
              onNewFile={(parentId) => createNewFile(parentId, true)}
              onNewFolder={(parentId) => createNewFolder(parentId, true)}
              path={[]}
            />
          ))}
        </div>
        <div className="md:w-1/2 w-full bg-[#242424] p-4">
          <h2 className="text-lg font-bold mb-2">Right Tree</h2>
          {rightTree.map((node) => (
            <TreeNode
              key={node.id}
              node={node}
              onMove={(draggedNode, targetNode) =>
                moveNode(draggedNode, targetNode, true)
              }
              onDelete={(nodeId) => deleteNode(nodeId, false)}
              onRename={(nodeId, newName) => renameNode(nodeId, newName, false)}
              onNewFile={(parentId) => createNewFile(parentId, false)}
              onNewFolder={(parentId) => createNewFolder(parentId, false)}
              path={[]}
            />
          ))}
        </div>
      </div>
    </DndProvider>
  );
}
