import styled from 'styled-components';

const Loader = () => {
    return (
        <StyledWrapper>
            <div className="loader" />
        </StyledWrapper>
    );
}

const StyledWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh; /* Full viewport height */
  width: 100vw; /* Full viewport width */
  position: fixed; /* Or absolute, depending on your layout needs */
  top: 0;
  left: 0;
  background-color: rgba(255, 255, 255, 0.8); /* Optional: adds a semi-transparent background */
  z-index: 9999; /* Ensure it's on top */

  .loader {
    width: 128px; /* Increased from 64px */
    height: 128px; /* Increased from 64px */
    position: relative;
    background: #f4f4f4;
    border-radius: 8px; /* Optional: increased from 4px */
    overflow: hidden;
  }

  .loader:before {
    content: "";
    position: absolute;
    left: 0;
    bottom: 0;
    width: 80px; /* Increased from 40px */
    height: 80px; /* Increased from 40px */
    transform: rotate(45deg) translate(30%, 40%);
    background: #2e86de;
    box-shadow: 64px -68px 0 10px #0097e6; /* Increased from 32px -34px 0 5px */
    animation: slide 2s infinite ease-in-out alternate;
  }

  .loader:after {
    content: "";
    position: absolute;
    left: 20px; /* Increased from 10px */
    top: 20px; /* Increased from 10px */
    width: 32px; /* Increased from 16px */
    height: 32px; /* Increased from 16px */
    border-radius: 50%;
    background: #0097e6;
    transform: rotate(0deg);
    transform-origin: 70px 290px; /* Increased from 35px 145px */
    animation: rotate 2s infinite ease-in-out;
  }

  @keyframes slide {
    0% , 100% {
      bottom: -70px /* Increased from -35px */
    }

    25% , 75% {
      bottom: -4px /* Increased from -2px */
    }

    20% , 80% {
      bottom: 4px /* Increased from 2px */
    }
  }

  @keyframes rotate {
    0% {
      transform: rotate(-15deg)
    }

    25% , 75% {
      transform: rotate(0deg)
    }

    100% {
      transform: rotate(25deg)
    }
  }`;

export default Loader;
