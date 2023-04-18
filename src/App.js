import React from "react";
import axios from "axios";
import { useState } from "react";
import Canvas from "./components/Canvas";
import { useEffect } from "react";
import "./App.css";
import CSRFToken from "./CSRFToken";

function App() {
  let [pendulum_list, setPendulum_list] = useState([]);
  let [graph_list, setGraph_list] = useState([]);

  useEffect(() => {
    axios
      .get("https://leader282937.pythonanywhere.com")
      .then((res) => {
        setPendulum_list(res.data);
      })
      .catch((err) => {});

    axios
      .get("https://leader282937.pythonanywhere.com/graph")
      .then((res) => {
        setGraph_list(res.data);
      })
      .catch((err) => {});
  }, []);

  return (
    <div className="total">
      {pendulum_list.length > 0 && <Canvas pendulum_list={pendulum_list} graph_list={graph_list} />}
      {pendulum_list.length == 0 && <div class="dummy"></div>}
      <div className="forms">
        <form method="post" action="https://leader282937.pythonanywhere.com/delete">
          <CSRFToken />
          <h3>Delete a Pendulum</h3>
          <hr />
          <select
            className="form-select"
            aria-label="Default select example"
            id="pc"
            name="delete"
          >
            {pendulum_list.length > 0 &&
              pendulum_list.map((pendulum, key) => {
                return (
                  <option value={pendulum.id} key={key}>
                    {pendulum.color.toUpperCase()}
                  </option>
                );
              })}
          </select>
          <hr />
          <button type="submit" className="btn btn-primary btn-block">
            Submit
          </button>
        </form>
        <form method="post" action="https://leader282937.pythonanywhere.com/">
          <CSRFToken />
          <h3>Pendulum Upper Part</h3>
          <hr />
          {/* Length input */}
          <div className="form-outline mb-2">
            <label className="form-label" htmlFor="pl1">
              Length
            </label>
            <input
              type="number"
              id="pl1"
              className="form-control"
              step={1}
              placeholder={130}
              name="l1"
            />
          </div>
          {/* Mass input */}
          <div className="form-outline mb-2">
            <label className="form-label" htmlFor="pm1">
              Mass
            </label>
            <input
              type="number"
              id="pm1"
              className="form-control"
              step="0.01"
              placeholder="0.1"
              name="m1"
            />
          </div>
          {/* Angle input */}
          <div className="form-outline mb-2">
            <label className="form-label" htmlFor="pt1">
              Theta 1 (Radians)
            </label>
            <input
              type="number"
              id="pt1"
              className="form-control"
              step="0.00001"
              placeholder="0.1"
              name="theta1"
            />
          </div>
          <hr />
          <h3>Pendulum Lower Part</h3>
          <hr />
          {/* Length input */}
          <div className="form-outline mb-2">
            <label className="form-label" htmlFor="pl2">
              Length
            </label>
            <input
              type="number"
              id="pl2"
              className="form-control"
              step={1}
              placeholder={130}
              name="l2"
            />
          </div>
          {/* Mass input */}
          <div className="form-outline mb-2">
            <label className="form-label" htmlFor="pm2">
              Mass
            </label>
            <input
              type="number"
              id="pm2"
              className="form-control"
              step="0.01"
              placeholder="0.1"
              name="m2"
            />
          </div>
          {/* Angle input */}
          <div className="form-outline mb-2">
            <label className="form-label" htmlFor="pt2">
              Theta 2 (Radians)
            </label>
            <input
              type="number"
              id="pt2"
              className="form-control"
              step="0.00001"
              placeholder="0.1"
              name="theta2"
            />
          </div>
          <hr />
          {/* Color input */}
          <label className="form-label" htmlFor="pc" style={{marginRight: 20}}>
            Color
          </label>
          <select
            className="form-select"
            aria-label="Default select example"
            id="pc"
            name="color"
          >
            <option value={"blue"}>Blue</option>
            <option value={"red"}>Red</option>
            <option value={"green"}>Green</option>
            <option value={"violet"}>Violet</option>
            <option value={"brown"}>Brown</option>
          </select>
          <hr />
          {/* Submit button */}
          <button type="submit" className="btn btn-primary btn-block">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
