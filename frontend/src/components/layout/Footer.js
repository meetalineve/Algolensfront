// frontend/src/components/layout/Footer.js
import React, { useState } from 'react';
import Modal from './Modal';
import './layout.css';

function Footer() {
  const [activeModal, setActiveModal] = useState(null);

  const openModal = (modalName) => {
    setActiveModal(modalName);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <>
      <footer className="footer">
        <div className="footer-content">
          <a href="#" onClick={(e) => { e.preventDefault(); openModal('about'); }} className="footer-link">About</a>
          <a href="#" onClick={(e) => { e.preventDefault(); openModal('team'); }} className="footer-link">Team</a>
          <a href="#" onClick={(e) => { e.preventDefault(); openModal('terms'); }} className="footer-link">Terms of Use</a>
          <a href="#" onClick={(e) => { e.preventDefault(); openModal('privacy'); }} className="footer-link">Privacy Policy</a>
        </div>
      </footer>
      
      <AboutModal active={activeModal === 'about'} closeModal={closeModal} />
      <TeamModal active={activeModal === 'team'} closeModal={closeModal} />
      <TermsModal active={activeModal === 'terms'} closeModal={closeModal} />
      <PrivacyModal active={activeModal === 'privacy'} closeModal={closeModal} />
    </>
  );
}

function AboutModal({ active, closeModal }) {
  return (
    <Modal active={active} closeModal={closeModal} title="ABOUT">
      <p>hi</p>
      <p>hii</p>
      <p>heehaw</p>
      <p>slay</p>
    </Modal>
  );
}

function TeamModal({ active, closeModal }) {
  return (
    <Modal active={active} closeModal={closeModal} title="TEAM">
      <p>Our team consists of passionate educators and developers dedicated to making algorithm visualization accessible to everyone.</p>
      
      <p>Core Team:</p>
      <ul>
        <li><strong>Meetali Neve</strong> - Lead Developer</li>
        <li><strong>Ketaki Mahajan</strong> - UI/UX Designer</li>
        <li><strong>Ibraheem Mir</strong> - Algorithm Specialist</li>
      </ul>
      
      <p>We are constantly working to improve AlgoLens and bring new visualizations to help students understand complex algorithms.</p>
    </Modal>
  );
}

function TermsModal({ active, closeModal }) {
  return (
    <Modal active={active} closeModal={closeModal} title="TERMS OF USE">
      <p>qwertyuiop</p>
    </Modal>
  );
}

function PrivacyModal({ active, closeModal }) {
  return (
    <Modal active={active} closeModal={closeModal} title="PRIVACY POLICY">
      <p>asdfghjkl</p>
    </Modal>
  );
}

export default Footer;