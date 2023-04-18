import "./canvas.css";
import { useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { faMinus } from "@fortawesome/free-solid-svg-icons";
import CSRFToken from "../CSRFToken";

let g = -0.05;
library.add(faPlus);
library.add(faMinus);

class Pendulum {
  constructor(
    color,
    theta1,
    theta2,
    m1 = 0.1,
    m2 = 0.1,
    l1 = 150,
    l2 = 120,
    PREV_POINT
  ) {
    this.theta1 = theta1;
    this.theta2 = theta2;
    this.m1 = m1;
    this.m2 = m2;
    this.l1 = l1;
    this.l2 = l2;
    this.omega1 = 0;
    this.omega2 = 0;
    this.color = color;
    this.PREV_POINT = PREV_POINT;
  }

  calc_omega1p() {
    return (
      -(
        g * (2 * this.m1 + this.m2) * Math.sin(this.theta1) +
        this.m2 * g * Math.sin(this.theta1 - 2 * this.theta2) +
        2 *
          Math.sin(this.theta1 - this.theta2) *
          this.m2 *
          (this.omega2 * this.omega2 * this.l2 +
            this.omega1 *
              this.omega1 *
              this.l1 *
              Math.cos(this.theta1 - this.theta2))
      ) /
      (this.l1 *
        (2 * this.m1 +
          this.m2 -
          this.m2 * Math.cos(2 * this.theta1 - 2 * this.theta2)))
    );
  }

  calc_omega2p() {
    return (
      (2 *
        Math.sin(this.theta1 - this.theta2) *
        (this.omega1 * this.omega1 * this.l1 * (this.m1 + this.m2) +
          g * (this.m1 + this.m2) * Math.cos(this.theta1) +
          this.omega2 *
            this.omega2 *
            this.l2 *
            this.m2 *
            Math.cos(this.theta1 - this.theta2))) /
      (this.l1 *
        (2 * this.m1 +
          this.m2 -
          this.m2 * Math.cos(2 * this.theta1 - 2 * this.theta2)))
    );
  }

  draw_pendulum(ctx) {
    let HINGE_POINTS = [400, 130];
    ctx.strokeStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(HINGE_POINTS[0], HINGE_POINTS[1]);
    ctx.lineTo(
      HINGE_POINTS[0] - this.l1 * Math.sin(this.theta1),
      HINGE_POINTS[1] - this.l1 * Math.cos(this.theta1)
    );
    ctx.lineTo(
      HINGE_POINTS[0] -
        this.l1 * Math.sin(this.theta1) -
        this.l2 * Math.sin(this.theta2),
      HINGE_POINTS[1] -
        this.l1 * Math.cos(this.theta1) -
        this.l2 * Math.cos(this.theta2)
    );
    ctx.fillStyle = `rgba(255,255,255,0.5)`;
    ctx.stroke();
  }

  update_omega() {
    let omega1p = this.calc_omega1p();
    let omega2p = this.calc_omega2p();
    this.omega1 = this.omega1 + omega1p;
    this.omega2 = this.omega2 + omega2p;
  }

  update_theta() {
    this.theta1 = this.theta1 + this.omega1;
    this.theta2 = this.theta2 + this.omega2;
    if (this.theta1 > Math.PI) {
      this.theta1 = this.theta1 - 2 * Math.PI;
    }
    if (this.theta1 < -Math.PI) {
      this.theta1 = this.theta1 + 2 * Math.PI;
    }
    if (this.theta2 > Math.PI) {
      this.theta2 = this.theta2 - 2 * Math.PI;
    }
    if (this.theta2 < -Math.PI) {
      this.theta2 = this.theta2 + 2 * Math.PI;
    }
  }
}

class Axis {
  constructor(axis_name, pendulum) {
    this.axisn = axis_name;
    this.pendulum = pendulum;
  }

  compute_axis() {
    if (this.axisn == "Theta 1") {
      let theta1 = this.pendulum.theta1 + Math.PI;
      if (theta1 > Math.PI) {
        theta1 = theta1 - 2 * Math.PI;
      }
      if (theta1 < -Math.PI) {
        theta1 = theta1 + 2 * Math.PI;
      }
      return theta1 / (2 * Math.PI) + 0.5;
    }
    if (this.axisn == "Theta 2") {
      let theta2 = this.pendulum.theta2 + Math.PI;
      if (theta2 > Math.PI) {
        theta2 = theta2 - 2 * Math.PI;
      }
      if (theta2 < -Math.PI) {
        theta2 = theta2 + 2 * Math.PI;
      }
      return theta2 / (2 * Math.PI) + 0.5;
    }
    if (this.axisn == "KE") {
      let KE =
        0.5 *
          this.pendulum.m1 *
          this.pendulum.l1 *
          this.pendulum.l1 *
          this.pendulum.omega1 *
          this.pendulum.omega1 +
        0.5 *
          this.pendulum.m2 *
          (this.pendulum.l1 *
            this.pendulum.l1 *
            this.pendulum.omega1 *
            this.pendulum.omega1 +
            this.pendulum.l2 *
              this.pendulum.l2 *
              this.pendulum.omega2 *
              this.pendulum.omega2 +
            2 *
              this.pendulum.l1 *
              this.pendulum.l2 *
              this.pendulum.omega1 *
              this.pendulum.omega2 *
              Math.cos(this.pendulum.theta1 - this.pendulum.theta2));
      let scale = 0.2;
      return KE * scale;
    }
    if (this.axisn == "PE") {
      let I_PE =
        (this.pendulum.m1 + this.pendulum.m2) * g * this.pendulum.l1 +
        this.pendulum.m2 * g * this.pendulum.l2;
      let PE =
        -(this.pendulum.m1 + this.pendulum.m2) *
          g *
          this.pendulum.l1 *
          Math.cos(this.pendulum.theta1) -
        this.pendulum.m2 *
          g *
          this.pendulum.l2 *
          Math.cos(this.pendulum.theta2);
      let scale = 0.4;
      return (PE - I_PE) * scale;
    }
    return 0;
  }
}

class Graph {
  constructor(ctx, axisl, axisb, pendulum) {
    this.axisl = axisl;
    this.axisb = axisb;
    this.ctx = ctx;
    this.pendulum = pendulum;
    this.GRAPH_TOP = 200;
    this.GRAPH_LEFT = 200;
    this.GRAPH_WIDTH = 400;
    this.GRAPH_HEIGHT = 400;
    this.GRAPH_BOTTOM = this.GRAPH_TOP + this.GRAPH_HEIGHT;
    this.GRAPH_RIGHT = this.GRAPH_LEFT + this.GRAPH_WIDTH;
    this.ORIGIN = [this.GRAPH_LEFT, this.GRAPH_BOTTOM];

    if (this.axisl == "Theta 1" || this.axisl == "Theta 2") {
      this.axisl_list = ["-π", "-π/2", "0", "π/2", "π"];
    }
    if (this.axisl == "KE" || this.axisl == "PE") {
      this.axisl_list = ["0", "1", "2", "3", "4"];
    }
    if (this.axisb == "Theta 1" || this.axisb == "Theta 2") {
      this.axisb_list = ["-π", "-π/2", "0", "π/2", "π"];
    }
    if (this.axisb == "KE" || this.axisb == "PE") {
      this.axisb_list = ["0", "1", "2", "3", "4"];
    }

    this.ctx.fillRect(
      this.GRAPH_LEFT,
      this.GRAPH_TOP,
      this.GRAPH_WIDTH,
      this.GRAPH_HEIGHT
    );

    this.ctx.beginPath();

    // Graph barebone
    this.ctx.moveTo(this.GRAPH_LEFT, this.GRAPH_TOP);
    this.ctx.lineTo(this.GRAPH_LEFT, this.GRAPH_BOTTOM);
    this.ctx.lineTo(this.GRAPH_RIGHT, this.GRAPH_BOTTOM);
    this.ctx.lineTo(this.GRAPH_RIGHT, this.GRAPH_TOP);
    this.ctx.lineTo(this.GRAPH_LEFT, this.GRAPH_TOP);
  }

  axis_build() {
    this.ctx.font = "17px Arial";
    this.ctx.strokeStyle = "black";
    this.ctx.lineWidth = 1;
    this.ctx.fillText(
      this.axisl,
      this.GRAPH_LEFT - 130,
      (this.GRAPH_TOP + this.GRAPH_BOTTOM) / 2
    );
    this.ctx.fillText(
      this.axisl_list[4],
      this.GRAPH_LEFT - 35,
      this.GRAPH_TOP + 20
    );
    this.ctx.fillText(
      this.axisl_list[3],
      this.GRAPH_LEFT - 35,
      this.GRAPH_TOP + this.GRAPH_HEIGHT * 0.25 + 10
    );
    this.ctx.fillText(
      this.axisl_list[2],
      this.GRAPH_LEFT - 35,
      (this.GRAPH_TOP + this.GRAPH_BOTTOM) / 2
    );
    this.ctx.fillText(
      this.axisl_list[1],
      this.GRAPH_LEFT - 35,
      this.GRAPH_TOP + this.GRAPH_HEIGHT * 0.7 + 10
    );
    this.ctx.fillText(
      this.axisl_list[0],
      this.GRAPH_LEFT - 35,
      this.GRAPH_BOTTOM - 10
    );
    this.ctx.fillText(
      this.axisb,
      (this.GRAPH_LEFT + this.GRAPH_RIGHT) / 2 - 20,
      this.GRAPH_BOTTOM + 60
    );
    this.ctx.fillText(
      this.axisb_list[0],
      this.GRAPH_LEFT,
      this.GRAPH_BOTTOM + 20
    );
    this.ctx.fillText(
      this.axisb_list[1],
      this.GRAPH_LEFT + this.GRAPH_WIDTH * 0.25 - 10,
      this.GRAPH_BOTTOM + 20
    );
    this.ctx.fillText(
      this.axisb_list[2],
      (this.GRAPH_LEFT + this.GRAPH_RIGHT) / 2,
      this.GRAPH_BOTTOM + 20
    );
    this.ctx.fillText(
      this.axisb_list[3],
      this.GRAPH_LEFT + this.GRAPH_WIDTH * 0.75 - 10,
      this.GRAPH_BOTTOM + 20
    );
    this.ctx.fillText(
      this.axisb_list[4],
      this.GRAPH_RIGHT - 20,
      this.GRAPH_BOTTOM + 20
    );
    this.ctx.stroke();
  }

  fill_graph(idx) {
    this.ctx.beginPath();
    this.ctx.strokeStyle = this.pendulum.color;
    this.ctx.lineWidth = 2;
    let axisl = new Axis(this.axisl, this.pendulum);
    let axisb = new Axis(this.axisb, this.pendulum);
    let NEW_POINT = [
      this.ORIGIN[0] + axisb.compute_axis() * this.GRAPH_WIDTH,
      this.ORIGIN[1] - axisl.compute_axis() * this.GRAPH_HEIGHT,
    ];
    if (this.pendulum.PREV_POINT[idx][0] == 0) {
      this.pendulum.PREV_POINT[idx] = NEW_POINT;
    }
    this.ctx.moveTo(
      this.pendulum.PREV_POINT[idx][0],
      this.pendulum.PREV_POINT[idx][1]
    );
    this.ctx.lineTo(NEW_POINT[0], NEW_POINT[1]);
    if (
      Math.abs(this.pendulum.PREV_POINT[idx][0] - NEW_POINT[0]) < 10 &&
      Math.abs(this.pendulum.PREV_POINT[idx][1] - NEW_POINT[1]) < 10 &&
      NEW_POINT[1] > this.GRAPH_TOP + 5 &&
      NEW_POINT[1] < this.GRAPH_BOTTOM &&
      NEW_POINT[0] > this.GRAPH_LEFT &&
      NEW_POINT[0] < this.GRAPH_RIGHT - 5
    ) {
      this.ctx.fillStyle = `rgba(255, 255, 255, 0.002)`;
      this.ctx.stroke();
    }
    this.pendulum.PREV_POINT[idx] = NEW_POINT;
  }
}

function Canvas({ pendulum_list, graph_list }) {
  const canvas1Ref = useRef(null);
  const canvasrefs = useRef([]);
  useEffect(() => {
    canvasrefs.current = canvasrefs.current.slice(0, graph_list.length);
  }, [graph_list]);
  const requestIdRef = useRef(null);
  const size1 = {
    width: window.innerWidth * 0.7,
    height: window.innerHeight * 0.5,
  };
  const size2 = {
    width: window.innerWidth * 0.7,
    height: window.innerHeight * 0.8,
  };

  function init() {
    if (!canvas1Ref.current) return;
    graph_list.map((_, idx) => {
      if (canvasrefs.current[idx] === undefined) return;
    });
    let pendulum_list_new = [];
    pendulum_list.map((pendulum) => {
      let prev_point_list = [];
      graph_list.map(() => {
        prev_point_list.push([0, 0]);
      });
      const pendulum_new = new Pendulum(
        pendulum.color,
        pendulum.theta1,
        pendulum.theta2,
        pendulum.m1,
        pendulum.m2,
        pendulum.l1,
        pendulum.l2,
        prev_point_list
      );
      pendulum_list_new.push(pendulum_new);
    });
    requestIdRef.current = requestAnimationFrame(() => {
      draw(pendulum_list_new);
    });
  }

  function draw(pendulum_list) {
    const ctx1 = canvas1Ref.current.getContext("2d");

    ctx1.fillRect(0, 0, size1.width, size1.height);
    ctx1.lineWidth = 3;

    pendulum_list.map((pendulum) => {
      pendulum.draw_pendulum(ctx1);
    });

    pendulum_list.map((pendulum) => {
      pendulum.update_omega();
    });

    pendulum_list.map((pendulum) => {
      pendulum.update_theta();
    });

    pendulum_list.map((pendulum) => {
      draw_graph(pendulum, canvasrefs.current);
    });

    requestIdRef.current = requestAnimationFrame(() => {
      draw(pendulum_list);
    });
  }

  function draw_graph(pendulum, ctxs) {
    graph_list.map((graph, idx) => {
      let graph_new = new Graph(
        ctxs[idx].getContext("2d"),
        graph.axis_l,
        graph.axis_b,
        pendulum
      );
      graph_new.axis_build();
      graph_new.fill_graph(idx);
    });
  }

  useEffect(() => {
    requestIdRef.current = init();
    return () => {
      cancelAnimationFrame(requestIdRef.current);
    };
  }, []);

  return (
    <div className="canvases">
      <canvas {...size1} ref={canvas1Ref} id="canvas1" />
      {graph_list.map((_, idx) => {
        return (
          <div class="graph">
            <canvas
              {...size2}
              ref={(el) => (canvasrefs.current[idx] = el)}
              key={idx}
            />
            <form method="post" action="https://leader282937.pythonanywhere.com/remove" className="removegraph">
              <CSRFToken />
              <input type="hidden" value={graph_list[idx].axis_l + ":" + graph_list[idx].axis_b} name="graph" />
              <button type="submit" className="fa-button">
                <FontAwesomeIcon
                  icon="fa-solid fa-minus"
                  size="6x"
                  style={{ marginTop: 350 }}
                />
              </button>
            </form>
          </div>
        );
      })}
      <form
        method="post"
        action="https://leader282937.pythonanywhere.com/graph"
        className="addgraph"
      >
        <label className="form-label" htmlFor="ax1">
          Axis 1
        </label>
        <select
          className="form-select"
          aria-label="Default select example"
          id="ax1"
          name="axis_l"
        >
          <option value={"Theta 1"}>Theta 1</option>
          <option value={"Theta 2"}>Theta 2</option>
          <option value={"KE"}>Kinetic Energy</option>
          <option value={"PE"}>Potential Energy</option>
        </select>
        <br />
        <label className="form-label" htmlFor="ax2">
          Axis 2
        </label>
        <select
          className="form-select"
          aria-label="Default select example"
          id="ax2"
          name="axis_b"
        >
          <option value={"Theta 1"}>Theta 1</option>
          <option value={"Theta 2"}>Theta 2</option>
          <option value={"KE"}>Kinetic Energy</option>
          <option value={"PE"}>Potential Energy</option>
        </select>
        <button type="submit" className="fa-button">
          <FontAwesomeIcon
            icon="fa-solid fa-plus"
            size="7x"
            style={{ marginTop: 20 }}
          />
        </button>
      </form>
    </div>
  );
}

export default Canvas;
