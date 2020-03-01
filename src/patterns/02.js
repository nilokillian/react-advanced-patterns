import React, {
  useState,
  useLayoutEffect,
  useCallback,
  Component,
  createContext,
  useContext,
  useMemo,
  useEffect,
  useRef
} from "react";
import * as mojs from "mo-js";
import styles from "./index.css";

const initialState = {
  count: 0,
  countTotal: 267,
  isClicked: false
};

const useAnimateMediumClap = ({ clapRef, countTotalRef, clapCountRef }) => {
  const [animationTimeLine, setAnimationTimeLine] = useState(
    () => new mojs.Timeline()
  );

  useLayoutEffect(() => {
    if (!clapRef || !countTotalRef || !clapCountRef) {
      return;
    }

    const scaleBtn = new mojs.Html({
      el: clapRef,
      duration: 300,
      scale: { 1.3: 1 },
      easing: mojs.easing.ease.out
    });

    const countTotalAnimation = new mojs.Html({
      el: countTotalRef,
      opacity: { 0: 1 },
      delay: (3 + 300) / 2,
      duration: 300,
      y: { 0: -3 }
    });

    const clapCountAnimation = new mojs.Html({
      el: clapCountRef,
      opacity: { 0: 1 },
      //delay: (3 + 300) / 2,
      duration: 300,
      y: { 0: -30 }
    }).then({
      opacity: { 1: 0 },
      y: -80,
      delay: 300 / 2
    });

    const triangleBurst = new mojs.Burst({
      parent: clapRef,
      radius: { 50: 95 },
      count: 5,
      angle: 30,
      children: {
        shape: "polygon",
        radius: { 6: 0 },
        stroke: "rgba(211,54,0,0.5)",
        angle: 210,
        delay: 30,
        speed: 0.2,
        easing: mojs.easing.bezier(0.1, 1, 0.3, 1),
        duration: 300
      }
    });

    const circleBurst = new mojs.Burst({
      parent: clapRef,
      radius: { 50: 75 },
      angle: 30,
      duration: 300,
      children: {
        shape: "circle",
        radius: { 3: 0 },
        fill: "rgba(211,54,0,0.5)",
        delay: 30,
        speed: 0.1,
        easing: mojs.easing.bezier(0.1, 1, 0.3, 1),
        duration: 300
      }
    });

    if (typeof clapRef === "string") {
      const clap = document.getElementById("clap");
      clap.style.transform = "scale(1,1)";
    } else {
      clapRef.style.transform = "scale(1,1)";
    }

    const newAnimationTimeLine = animationTimeLine.add([
      scaleBtn,
      countTotalAnimation,
      clapCountAnimation,
      triangleBurst,
      circleBurst
    ]);
    setAnimationTimeLine(newAnimationTimeLine);
  }, [clapRef, countTotalRef, clapCountRef]);

  return animationTimeLine;
};

const withClapAnimation = WrappedComponent => {
  class WithClapAnimation extends Component {
    constructor(props) {
      super(props);
      //animationTimeLine = new mojs.Timeline();
      this.state = {
        animationTimeLine: new mojs.Timeline()
      };
    }

    componentDidMount() {
      const scaleBtn = new mojs.Html({
        el: "#clap",
        duration: 300,
        scale: { 1.3: 1 },
        easing: mojs.easing.ease.out
      });

      const countTotalAnimation = new mojs.Html({
        el: "#countTotal",
        opacity: { 0: 1 },
        delay: (3 + 300) / 2,
        duration: 300,
        y: { 0: -3 }
      });

      const clapCountAnimation = new mojs.Html({
        el: "#clapCount",
        opacity: { 0: 1 },
        //delay: (3 + 300) / 2,
        duration: 300,
        y: { 0: -30 }
      }).then({
        opacity: { 1: 0 },
        y: -80,
        delay: 300 / 2
      });

      const triangleBurst = new mojs.Burst({
        parent: "#clap",
        radius: { 50: 95 },
        count: 5,
        angle: 30,
        children: {
          shape: "polygon",
          radius: { 6: 0 },
          stroke: "rgba(211,54,0,0.5)",
          angle: 210,
          delay: 30,
          speed: 0.2,
          easing: mojs.easing.bezier(0.1, 1, 0.3, 1),
          duration: 300
        }
      });

      const circleBurst = new mojs.Burst({
        parent: "#clap",
        radius: { 50: 75 },
        angle: 30,
        duration: 300,
        children: {
          shape: "circle",
          radius: { 3: 0 },
          fill: "rgba(211,54,0,0.5)",
          delay: 30,
          speed: 0.1,
          easing: mojs.easing.bezier(0.1, 1, 0.3, 1),
          duration: 300
        }
      });

      const clap = document.getElementById("clap");
      clap.style.transform = "scale(1,1)";

      const newAnimationTimeLine = this.state.animationTimeLine.add([
        scaleBtn,
        countTotalAnimation,
        clapCountAnimation,
        triangleBurst,
        circleBurst
      ]);
      this.setState({ animationTimeLine: newAnimationTimeLine });
    }

    render() {
      return (
        <WrappedComponent
          {...this.props}
          animationTimeLine={this.state.animationTimeLine}
        />
      );
    }
  }

  return WithClapAnimation;
};

const MediumClapContext = createContext();
const { Provider } = MediumClapContext;

const MediumClap = ({ children, onClap }) => {
  const MAX_USER_CLAP = 12;
  const [clapState, setClapState] = useState(initialState);
  const { count } = clapState;
  const [{ clapRef, countTotalRef, clapCountRef }, setRefsState] = useState({});

  const animationTimeLine = useAnimateMediumClap({
    clapRef,
    countTotalRef,
    clapCountRef
  });

  const setRef = useCallback(node => {
    setRefsState(prevRefsState => ({
      ...prevRefsState,
      [node.dataset.refkey]: node
    }));
  }, []);

  const componentJustMounted = useRef(true);

  useEffect(() => {
    console.log("componentMounted.current", componentJustMounted.current);
    if (!componentJustMounted.current) {
      console.log("onClap clicked");
      onClap && onClap(clapState);
    }
    componentJustMounted.current = false;
  }, [count]);

  const handleClap = () => {
    animationTimeLine.replay();
    setClapState(prevState => ({
      isClicked: true,
      count: Math.min(prevState.count + 1, MAX_USER_CLAP),
      countTotal:
        count < MAX_USER_CLAP ? prevState.countTotal + 1 : prevState.countTotal
    }));
  };

  const memoizedValue = useMemo(
    () => ({
      ...clapState,
      setRef
    }),
    [clapState, setRef]
  );
  return (
    <Provider value={memoizedValue}>
      <button
        ref={setRef}
        data-refkey="clapRef"
        className={styles.clap}
        onClick={handleClap}
      >
        {children}
      </button>
    </Provider>
  );
};

//sub components

const ClapIcon = () => {
  const { isClicked } = useContext(MediumClapContext);
  return (
    <span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="-549 338 100.1 125"
        className={`${styles.icon} ${isClicked && styles.checked}`}
      >
        <path d="M-471.2 366.8c1.2 1.1 1.9 2.6 2.3 4.1.4-.3.8-.5 1.2-.7 1-1.9.7-4.3-1-5.9-2-1.9-5.2-1.9-7.2.1l-.2.2c1.8.1 3.6.9 4.9 2.2zm-28.8 14c.4.9.7 1.9.8 3.1l16.5-16.9c.6-.6 1.4-1.1 2.1-1.5 1-1.9.7-4.4-.9-6-2-1.9-5.2-1.9-7.2.1l-15.5 15.9c2.3 2.2 3.1 3 4.2 5.3zm-38.9 39.7c-.1-8.9 3.2-17.2 9.4-23.6l18.6-19c.7-2 .5-4.1-.1-5.3-.8-1.8-1.3-2.3-3.6-4.5l-20.9 21.4c-10.6 10.8-11.2 27.6-2.3 39.3-.6-2.6-1-5.4-1.1-8.3z" />
        <path d="M-527.2 399.1l20.9-21.4c2.2 2.2 2.7 2.6 3.5 4.5.8 1.8 1 5.4-1.6 8l-11.8 12.2c-.5.5-.4 1.2 0 1.7.5.5 1.2.5 1.7 0l34-35c1.9-2 5.2-2.1 7.2-.1 2 1.9 2 5.2.1 7.2l-24.7 25.3c-.5.5-.4 1.2 0 1.7.5.5 1.2.5 1.7 0l28.5-29.3c2-2 5.2-2 7.1-.1 2 1.9 2 5.1.1 7.1l-28.5 29.3c-.5.5-.4 1.2 0 1.7.5.5 1.2.4 1.7 0l24.7-25.3c1.9-2 5.1-2.1 7.1-.1 2 1.9 2 5.2.1 7.2l-24.7 25.3c-.5.5-.4 1.2 0 1.7.5.5 1.2.5 1.7 0l14.6-15c2-2 5.2-2 7.2-.1 2 2 2.1 5.2.1 7.2l-27.6 28.4c-11.6 11.9-30.6 12.2-42.5.6-12-11.7-12.2-30.8-.6-42.7m18.1-48.4l-.7 4.9-2.2-4.4m7.6.9l-3.7 3.4 1.2-4.8m5.5 4.7l-4.8 1.6 3.1-3.9" />
      </svg>
    </span>
  );
};

const ClapCount = () => {
  const { count, setRef } = useContext(MediumClapContext);
  return (
    <span ref={setRef} data-refkey="clapCountRef" className={styles.count}>
      + {count}
    </span>
  );
};

const ClapTotal = () => {
  const { countTotal, setRef } = useContext(MediumClapContext);
  return (
    <span ref={setRef} data-refkey="countTotalRef" className={styles.total}>
      {countTotal}
    </span>
  );
};

MediumClap.ClapIcon = ClapIcon;
MediumClap.ClapCount = ClapCount;
MediumClap.ClapTotal = ClapTotal;

const Usage = () => {
  const [count, setCount] = useState(0);

  const handleOnClap = clapState => {
    setCount(clapState.count);
  };

  return (
    <div style={{ width: "100%" }}>
      <MediumClap onClap={handleOnClap}>
        <MediumClap.ClapIcon />
        <MediumClap.ClapCount />
        <MediumClap.ClapTotal />
      </MediumClap>
      <div className={styles.info}>{`You have clapped ${count}`}</div>
    </div>
  );
};

export default Usage;
