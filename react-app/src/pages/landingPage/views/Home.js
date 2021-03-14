import React from 'react';
// import sections
import Hero from '../components/sections/Hero';
import FeaturesTiles from '../components/sections/FeaturesTiles';
import '../assets/scss/landingPage.scoped.scss';


const Home = ({ handleTokensChange }) => {

  return (
    <>
      <Hero />
      <div></div>
      <FeaturesTiles />
    </>
  );
}

export default Home;