import React, { Component } from "react";
import {
  InputGroup,
  InputGroupButton,
  InputGroupAddon,
  Input,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Button
} from "reactstrap";
import Dropzone from "react-dropzone";

import TreeView from "react-treeview";
import {} from "react-treeview/react-treeview.css";

const electron = window.require("electron"); // little trick to import electron in react
const ipcRenderer = electron.ipcRenderer;
const { shell } = electron;

export default class PanelProject extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fileName: null,
      filePath: null,
      fileSize: null,
      lastModifiedDate: null,
      projectEntryPoint: null
    };
    //this.clickSelectDirector = this.clickSelectDirector.bind(this);
    this.readFile = this.readFile.bind(this);
    this.updateProject = this.updateProject.bind(this);

    //this.filesUpdated = this.filesUpdated.bind(this);
    this.openFolder = this.openFolder.bind(this);
    ipcRenderer.on("project-select-entry-return", (event, status, file) => {
      this.setState({ projectEntryPoint: file });
    });

    ipcRenderer.on("project-entry", this.updateProject);

    //ipcRenderer.on("file-update", this.filesUpdated);
  }

  updateProject(entry) {
    console.log("entry point", entry);

    //this.setState({})
  }
  
  openFolder() {
    var filePath = this.state.filePath;

    var path = "/Users/lucascassiano/Documents/GitHub/experimental_three/";
    console.log("file path",filePath);
    shell.showItemInFolder(filePath);
  }

  /*
  filesUpdated(event, type, fileName, filePath, content) {
    console.log(fileName, filePath, content);
    if (type == "main") {
      try {
        eval(content);
        console.log("file updated");
      } catch (err) {
        console.log("error", err);
      }
    }
  }
*/
  clickSelectDirector() {
    this.refs.fileUploader.click();
  }

  readFile(event) {
    //ipcRenderer.send("project-select-entry", event);
  }

  render() {
    const {
      fileName,
      filePath,
      lastModifiedDate,
      size,
      projectEntryPoint
    } = this.state;

    let dataSource = [];

    if (projectEntryPoint)
      dataSource = [
        {
          type: "Project Structure",
          collapsed: false,
          project: {
            name: projectEntryPoint.name,
            author: projectEntryPoint.author,
            creation_date: projectEntryPoint.creation_date,
            last_update: projectEntryPoint.last_update.toString()
          },
          files: [
            {
              type: "entry point",
              name: fileName,
              path: filePath,
              size: size,
              lastModified: lastModifiedDate.toString()
            }
          ]
        }
      ];

    return (
      <div>
        <div className="panel-label">Select Project</div>
        <div className="panel-item">
          <p>
            Entry point:
            {fileName ? (
              <h3 className="file-name">{fileName}</h3>
            ) : (
              <h3>select a file (.json)</h3>
            )}
          </p>
          <p>{filePath ? <div className="file-path">{filePath}</div> : null}</p>
        </div>
        <InputGroup>
          <Button onClick={this.openFolder} className="btn">
            Open Folder
          </Button>
        </InputGroup>
        <div className="panel-label">Project Structure</div>
        <div className="panel-item">
          {dataSource.map((node, i) => {
            const type = node.type;
            const label = <span className="node">{type}</span>;
            return (
              <TreeView
                key={type + "|" + i}
                nodeLabel={label}
                defaultCollapsed={false}
              >
                <div className="info">name: {node.project.name}</div>
                <div className="info">author: {node.project.author}</div>
                <div className="info">
                  creation date: {node.project.creation_date}
                </div>
                <div className="info">
                  last_update: {node.project.last_update}
                </div>

                {node.files.map(file => {
                  const label2 = <span className="node">indexed files</span>;
                  return (
                    <TreeView
                      nodeLabel={label2}
                      key={file.name}
                      defaultCollapsed={false}
                    >
                      <div className="info">path: {file.path}</div>
                      <div className="info">size: {file.size}</div>
                      <div className="info">type: {file.type}</div>
                      <div className="info">
                        lastModified: {file.lastModified}
                      </div>
                    </TreeView>
                  );
                })}
              </TreeView>
            );
          })}
        </div>
      </div>
    );
  }
}
