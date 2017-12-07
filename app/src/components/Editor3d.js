import React, { Component } from "react";
import ReactDOM from "react-dom";

import Container3d from "react-container-3d";
import CubeView from "react-cubeview";
import "react-cubeview/css/react-cubeview.css";
import * as _THREE from "three";

import AlertContainer from "react-alert";
import { RenderableVertex } from "three";

const electron = window.require("electron"); // little trick to import electron in react
const ipcRenderer = electron.ipcRenderer;

const THREE = _THREE;
let _this = null;

export default class Editor3d extends Component {
  constructor(props) {
    super(props);
    _this = this;
    this.state = {
      mainCode: null,
      setup: null,
      update: null,
      shaders: { vertex: new Object(), fragment: {} },
      models: {}
    };

    this.updateAngles = this.updateAngles.bind(this);
    this.filesUpdated = this.filesUpdated.bind(this);

    ipcRenderer.on("file-update", this.filesUpdated);
    _this.setup = (scene, camera, renderer) => {};
  }

  internalSetup(scene, camera, renderer) {
    //Load Shaders
    var shaders = _this.shaders;
    _this.setup(scene, camera, renderer);
  }

  executeCode() {
    var Setup = function() {};
    var Update = function() {};

    //load shaders and models
    var shaders = this.state.shaders;
    //var shaders = _this.shaders;

    eval(this.state.mainCode);

    _this.setup = Setup;

    this.setState({
      update: Update,
      setup: this.internalSetup
    });

    this.c3d.reloadScene();
  }
  filesUpdated(event, type, fileName, filePath, content) {
    if (type == "main") {
      try {
        this.setState({
          mainCode: content
        });
        this.executeCode();

        //this.c3d.reloadScene();
      } catch (err) {
        this.showAlert(err.toString(), "error");
      }
    }

    if (type == "vertex-shader") {
      try {
        var shader = content;
        
        var key = fileName.replace(".vert", "");
        var { shaders } = this.state;

        shaders.vertex[key] = content;
        this.shaders = shaders;
        this.setState({ shaders: shaders });
        this.executeCode();
        //this.c3d.reloadScene();
      } catch (err) {
        this.showAlert(err.toString(), "error");
      }
    } else if (type == "fragment-shader") {
      try {
        var shader = content;
        var key = fileName.replace(".frag", "");
        var { shaders } = this.state;
        shaders.fragment[key.toString()] = content;
        this.shaders = shaders;
        this.setState({ shaders: shaders });
        this.executeCode();
        // this.c3d.reloadScene();
      } catch (err) {
        this.showAlert(err.toString(), "error");
      }
    }

    //this.c3d.reloadScene();
  }

  //3D ui controllers
  getMainCanvas() {
    var mainCanvas = ReactDOM.findDOMNode(this.c3d);
    return mainCanvas;
  }

  //will update the camera angles/position from the orbitcontrols on the c3d
  updateAngles(phi, theta) {
    this.c3d.setAngles(phi, theta);
  }

  showAlert(msg, type) {
    this.msg.show(msg, {
      time: 2000,
      type: type ? type : "success"
    });
  }

  render() {
    return (
      <div className="canvas">
        <div className="canvas-3d">
          <Container3d
            percentageWidth={"100%"}
            fitScreen
            ref={c => (this.c3d = c)}
            key={"c3d"}
            setup={this.internalSetup}
            update={this.state.update}
            marginBottom={30}
            code={this.state.code}
          />
        </div>

        <div className="cube-view">
          <CubeView
            aspect={1}
            hoverColor={0x0088ff}
            cubeSize={2}
            zoom={6}
            antialias={true}
            onUpdateAngles={this.updateAngles}
            relatedCanvas={this.getMainCanvas}
            antialias
          />
        </div>

        <AlertContainer ref={a => (this.msg = a)} {...this.alertOptions} />
      </div>
    );
  }
}
