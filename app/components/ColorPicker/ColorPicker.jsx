import { useEffect, useRef, useState } from "react";
import { hexToRgb } from "./CovertColorValue";
function ColorPicker({ value, onChange = () => {} }) {
  const colorPickerRef = useRef();
  const pickerEl = useRef();
  const colorPickerMainRef = useRef();
  const canvasRef = useRef();
  const hueColorControlRef = useRef();
  const hueColorCircleRef = useRef();
  const hueColorPickerWrapperRef = useRef();
  const alphaControlRef = useRef();
  const alphaCircleRef = useRef();
  const alphaWrapperRef = useRef();
  const [currentColor, setCurrentColor] = useState(value);
  const [hueCurrentColor, setHueCurrentColor] = useState(value);
  const [alphaValue, setAlphaValue] = useState(1);
  const [color, setColor] = useState();
  const [colorValue, setColorValue] = useState(value);
  const [colorType, setColorType] = useState("hex");

  useEffect(() => {
    let isDragging = false;
    let initialX, initialY;

    const handleMouseDown = (e) => {
      e.preventDefault();
      e.type === "mousedown" ? (isDragging = true) : null;
      initialX = e.clientX;
      initialY = e.clientY;
    };

    const handleMouseMove = (e) => {
      if (isDragging) {
        const deltaX = e.clientX - initialX;
        const deltaY = e.clientY - initialY;

        // Calculate potential new positions
        const potentialNewLeft = pickerEl.current.offsetLeft + deltaX;
        const potentialNewTop = pickerEl.current.offsetTop + deltaY;

        // Enforce boundaries gracefully
        const constrainedLeft = Math.max(
          -5,
          Math.min(potentialNewLeft, 206 /* adjusted for margins */),
        );
        const constrainedTop = Math.max(
          -5,
          Math.min(potentialNewTop, 180 /* adjusted for margins */),
        );

        colorPickFunc(constrainedLeft, constrainedTop);
        pickerEl.current.style.left = `${constrainedLeft}px`;
        pickerEl.current.style.top = `${constrainedTop}px`;

        initialX = e.clientX;
        initialY = e.clientY;
      }
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    //get color
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let selectedColor;
    const colorPickFunc = (clientX, clientY) => {
      const rect = canvas.getBoundingClientRect();
      const x = initialX - rect.left;
      const y = initialY - rect.top;

      const imageData = ctx.getImageData(x, y, 1, 1).data;

      // Get the RGB values from the image data
      const red = imageData[0];
      const green = imageData[1];
      const blue = imageData[2];

      // Convert RGB to hex code
      const hex = `#${red.toString(16).padStart(2, "0")}${green
        .toString(16)
        .padStart(2, "0")}${blue.toString(16).padStart(2, "0")}`;

      selectedColor = hex;
      setCurrentColor(selectedColor);
      // console.log(selectedColor);
    };

    //set dynamic color
    let color = "#7300ff";
    ctx.fillStyle = hueCurrentColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let whiteGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    whiteGradient.addColorStop(0, "#fff");
    whiteGradient.addColorStop(1, "transparent");
    ctx.fillStyle = whiteGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let blackGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    blackGradient.addColorStop(0, "transparent");
    blackGradient.addColorStop(1, "#000");
    ctx.fillStyle = blackGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    pickerEl.current.addEventListener("mousedown", handleMouseDown);
    colorPickerRef.current.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      pickerEl.current.removeEventListener("mousedown", handleMouseDown);
      colorPickerRef.current.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [hueCurrentColor]);

  //hue color picker
  useEffect(() => {
    let isDragging = false;
    let initialX, initialY, left;
    const hueColor = hueColorControlRef.current;
    const hue = hueColor.getContext("2d");
    const gradient = hue.createLinearGradient(0, 0, hueColor.width, 0);

    gradient.addColorStop(0.0, "hsl(0, 100%, 50%)"); // red
    gradient.addColorStop(0.17, "hsl(60, 100%, 50%)"); // #ff0
    gradient.addColorStop(0.33, "hsl(120, 100%, 50%)"); // #0f0
    gradient.addColorStop(0.5, "hsl(180, 100%, 50%)"); // #0ff
    gradient.addColorStop(0.67, "hsl(240, 100%, 50%)"); // #00f
    gradient.addColorStop(0.83, "hsl(300, 100%, 50%)"); // #f0f
    gradient.addColorStop(1.0, "hsl(0, 100%, 50%)"); // red

    hue.fillStyle = gradient;
    hue.fillRect(
      0,
      0,
      hueColorControlRef.current.width,
      hueColorControlRef.current.height,
    );

    const ctx = hueColor.getContext("2d");
    let selectedColor;

    const handleMouseDown = (e) => {
      e.preventDefault();
      e.type === "mousedown" ? (isDragging = true) : false;
      initialX = e.clientX;
      initialY = e.clientY;
    };

    const moveElement = (e) => {
      const deltaX = e.clientX - initialX;
      const deltaY = e.clientY - initialY;
      const potentialNewLeft = hueColorCircleRef.current.offsetLeft + deltaX;

      const constrainedLeft = Math.max(0, Math.min(potentialNewLeft, 201));
      left = constrainedLeft;
      hueColorCircleRef.current.style.left = `${constrainedLeft}px`;

      colorPickFunc();

      initialX = e.clientX;
      initialY = e.clientY;
    };

    const handleMouseMove = (e) => {
      if (isDragging) {
        moveElement(e);
      }
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    // const handleMouseClicked = (e) => {
    //   moveElement(e);
    // };

    const colorPickFunc = () => {
      const rect = hueColor.getBoundingClientRect();
      const x = initialX - rect.left;
      const y = initialY - rect.top;
      // console.log(x, mapRangeToX(x));

      const imageData = ctx.getImageData(x + mapRangeToX(x), y, 1, 1).data;

      // Get the RGB values from the image data
      const red = imageData[0];
      const green = imageData[1];
      const blue = imageData[2];
      // console.log(red)
      // Convert RGB to hex code
      const hex = `#${red.toString(16).padStart(2, "0")}${green
        .toString(16)
        .padStart(2, "0")}${blue.toString(16).padStart(2, "0")}`;

      selectedColor = hex;
      setHueCurrentColor(selectedColor);
      // console.log(selectedColor);
    };

    hueColorCircleRef.current.addEventListener("mousedown", handleMouseDown);
    hueColorPickerWrapperRef.current.addEventListener(
      "mousemove",
      handleMouseMove,
    );
    // hueColorPickerWrapperRef.current.addEventListener(
    //   "click",
    //   handleMouseClicked
    // );
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      hueColorCircleRef.current.removeEventListener(
        "mousedown",
        handleMouseDown,
      );
      hueColorPickerWrapperRef.current.removeEventListener(
        "mousemove",
        handleMouseMove,
      );
      // hueColorPickerWrapperRef.current.removeEventListener(
      //   "click",
      //   handleMouseClicked
      // );
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  //Alpha
  useEffect(() => {
    let isDragging = false;
    let initialX, initialY;

    const handleMouseDown = (e) => {
      e.preventDefault();
      e.type === "mousedown" ? (isDragging = true) : false;
      initialX = e.clientX;
      initialY = e.clientY;
    };

    const moveElement = (e) => {
      const deltaX = e.clientX - initialX;
      const potentialNewLeft = alphaCircleRef.current.offsetLeft + deltaX;

      const constrainedLeft = Math.max(0, Math.min(potentialNewLeft, 201));
      alphaCircleRef.current.style.left = `${constrainedLeft}px`;
      setAlphaValue((constrainedLeft / 201).toFixed(2));
      // getColor(e);

      initialX = e.clientX;
      initialY = e.clientY;
    };

    const handleMouseMove = (e) => {
      if (isDragging) {
        // const deltaX = e.clientX - initialX;
        // const potentialNewLeft = alphaCircleRef.current.offsetLeft + deltaX;

        // const constrainedLeft = Math.max(0, Math.min(potentialNewLeft, 201));
        // alphaCircleRef.current.style.left = `${constrainedLeft}px`;
        // // console.log(Number((constrainedLeft / 201).toFixed(2)) === 1);
        // setAlphaValue((constrainedLeft / 201).toFixed(2));
        // // getColor(e);

        // initialX = e.clientX;
        // initialY = e.clientY;
        moveElement(e);
      }
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleMouseClick = (e) => {
      // const deltaX = e.clientX - initialX;
      // const potentialNewLeft = alphaCircleRef.current.offsetLeft + deltaX;

      // const constrainedLeft = Math.max(0, Math.min(potentialNewLeft, 201));
      // alphaCircleRef.current.style.left = `${constrainedLeft}px`;
      // // console.log(Number((constrainedLeft / 201).toFixed(2)) === 1);
      // setAlphaValue((constrainedLeft / 201).toFixed(2));
      // // getColor(e);

      // initialX = e.clientX;
      // initialY = e.clientY;
      moveElement(e);
    };

    alphaCircleRef.current.addEventListener("mousedown", handleMouseDown);
    alphaWrapperRef.current.addEventListener("mousemove", handleMouseMove);
    alphaWrapperRef.current.addEventListener("click", handleMouseClick);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      alphaCircleRef.current.removeEventListener("mousedown", handleMouseDown);
      alphaWrapperRef.current.removeEventListener("mousemove", handleMouseMove);
      alphaWrapperRef.current.removeEventListener("click", handleMouseClick);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [currentColor]);

  useEffect(() => {
    const _alpha = Math.round(Math.min(Math.max(alphaValue ?? 1, 0), 1) * 255);
    // console.log(_alpha)
    const alphaColor =
      _alpha < 16
        ? "0" + _alpha.toString(16).toUpperCase()
        : _alpha.toString(16).toUpperCase();
    // console.log(_alpha)
    _alpha < 255 ? setColor(currentColor + alphaColor) : setColor(currentColor);

    // console.log(color);
  }, [currentColor, hueCurrentColor, alphaValue]);
  // console.log(alphaValue)

  //set color type
  useEffect(() => {
    if (colorType === "hex") {
      setColorValue(color);
    } else if (colorType === "rgb") {
      setColorValue(`rgb${hexToRgb(currentColor, alphaValue).rgb}`);
    }
    // console.log(colorValue);
  }, [color, colorValue, colorType]);

  useEffect(() => {
    onChange(colorValue);
  }, [value, colorValue]);

  const id = Math.floor(Math.random() * 9999999999);

  return (
    <div>
      <style>{`
        .id-${id}.showColorValue:focus{
          outline:1px solid blue;
        }
      `}</style>
      <div
        style={{ position: "relative", width: "216px" }}
        className="shopify-color-picker-wrapper"
        ref={colorPickerMainRef}
      >
        <div
          ref={colorPickerRef}
          className="colorPickerArea"
          style={{
            height: "190px",
            width: "216px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* <div style={{ width: "230px", height: "180px" }}></div> */}
          <div
            ref={pickerEl}
            style={{
              position: "absolute",
              height: "15px",
              width: "15px",
              border: "2px solid #fff",
              top: "-5px",
              left: "-5px",
              borderRadius: "50%",
              background: currentColor,
            }}
          ></div>
          <canvas
            style={{ height: "100%", width: "100%", background: "#ccc" }}
            ref={canvasRef}
            className="spectrumColor"
          ></canvas>
        </div>
        <div
          ref={hueColorPickerWrapperRef}
          className="hueColorControl"
          style={{
            height: "15px",
            width: "216px",
            position: "relative",
            margin: "10px 0",
          }}
        >
          <canvas
            // className="hueColorPicker"
            ref={hueColorControlRef}
            style={{
              height: "15px",
              width: "100%",
              position: "absolute",
              borderRadius: "30px",
            }}
          ></canvas>
          <div
            ref={hueColorCircleRef}
            style={{
              height: "15px",
              width: "15px",
              border: "2px solid white",
              borderRadius: "30px",
              background: hueCurrentColor,
              position: "absolute",
              top: "50%",
              transform: "translateY(-50%)",
            }}
          ></div>
        </div>
        <div
          ref={alphaWrapperRef}
          style={{
            height: "15px",
            width: "216px",
            position: "relative",
            border: "1px solid #ccc",
            margin: "10px 0",
            borderRadius: "30px",

            backgroundColor: "#fff",
            backgroundImage: ` linear-gradient(
      45deg,
      #d5d8dc 25%,
      transparent 0,
      transparent 75%,
      #d5d8dc 0,
      #d5d8dc
    ),
    linear-gradient(
      45deg,
      #d5d8dc 25%,
      transparent 0,
      transparent 75%,
      #d5d8dc 0,
      #d5d8dc
    )`,
            backgroundPosition: "0 0, 8px 8px",
            backgroundSize: "16px 16px",
          }}
        >
          <div
            // className="hueColorPicker"
            ref={alphaControlRef}
            className="alphaTransparent"
            style={{
              height: "15px",
              width: "100%",
              position: "absolute",
              borderRadius: "30px",
              backgroundImage: `linear-gradient(90deg, #02002400 0%, ${currentColor} 100%)`,
            }}
          ></div>
          <div
            ref={alphaCircleRef}
            style={{
              height: "15px",
              width: "15px",
              border: "2px solid white",
              borderRadius: "30px",
              background: "transparent",
              position: "absolute",
              top: "50%",
              transform: "translateY(-50%)",
              backdropFilter: "blur(1px)",
              left: "201px",
            }}
          ></div>
        </div>
        {/* <div className="hueColorPicker"></div> */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {colorType === "hex" ? (
            <input
              type="text"
              value={color}
              className={`id-${id} showColorValue`}
              style={{
                padding: "10px",
                textTransform: "uppercase",
                width: "95px",
                border: "1px solid #ccc",
                borderRadius: "5px",
              }}
            />
          ) : (
            <div style={{ display: "flex", gap: "5px" }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <p
                  style={{
                    margin: "0px",
                    marginBottom: "-5px",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  {" "}
                  <small>R</small>
                </p>
                <input
                  className={`id-${id} showColorValue`}
                  style={{
                    padding: "5px",
                    textTransform: "uppercase",
                    width: "25px",
                    border: "1px solid #ccc",
                    borderRadius: "3px",
                  }}
                  value={hexToRgb(currentColor, alphaValue).r}
                  type="text"
                />
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <p
                  style={{
                    margin: "0px",
                    marginBottom: "-5px",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  {" "}
                  <small>G</small>
                </p>
                <input
                  className={`id-${id} showColorValue`}
                  style={{
                    padding: "5px",
                    textTransform: "uppercase",
                    width: "25px",
                    border: "1px solid #ccc",
                    borderRadius: "3px",
                  }}
                  value={hexToRgb(currentColor, alphaValue).g}
                  type="text"
                />
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <p
                  style={{
                    margin: "0px",
                    marginBottom: "-5px",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  {" "}
                  <small>B</small>
                </p>
                <input
                  className={`id-${id} showColorValue`}
                  style={{
                    padding: "5px",
                    textTransform: "uppercase",
                    width: "25px",
                    border: "1px solid #ccc",
                    borderRadius: "3px",
                  }}
                  value={hexToRgb(currentColor, alphaValue).b}
                  type="text"
                />
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <p
                  style={{
                    margin: "0px",
                    marginBottom: "-5px",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  {" "}
                  <small>A</small>
                </p>
                <input
                  className={`id-${id} showColorValue`}
                  style={{
                    padding: "5px",
                    textTransform: "uppercase",
                    width: "25px",
                    border: "1px solid #ccc",
                    borderRadius: "3px",
                  }}
                  value={hexToRgb(currentColor, alphaValue).a}
                  type="text"
                />
              </div>
            </div>
          )}

          <select name="" id="" onChange={(e) => setColorType(e.target.value)}>
            <option value="hex" defaultChecked>
              hex
            </option>
            <option value="rgb">rgb</option>
          </select>
        </div>
        <div
          style={{ background: color, height: "30px", width: "216px" }}
        ></div>
      </div>
    </div>
  );
}

export default ColorPicker;

export function mapRangeToX(value) {
  // Define the input range (0 to 216)
  const minValue = 0;
  const maxValue = 216;

  // Define the corresponding output values
  const xWhenMin = 11;
  const xWhenMax = 75;

  // Calculate the mapped value
  const mappedValue =
    xWhenMin +
    ((value - minValue) / (maxValue - minValue)) * (xWhenMax - xWhenMin);

  return mappedValue;
}
