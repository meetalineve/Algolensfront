// frontend/src/components/landing/LandingPage.js

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LandingPage.css';
import axios from 'axios';
import graphs from '../images/graphs.png';
import knapsack from '../images/knapsack.png';
import merge from '../images/merge.png';

import Binary from '../images/Binary-Search.png';
import quick from '../images/quick.png';
import subset from '../images/subset.png';
import selection from '../images/selection.png';
// Import a placeholder image for "coming soon" algorithms
import nqueen from '../images/nqueen.png';
import comingSoon from '../images/coming-soon.png'; // You'll need to create this placeholder image

const LandingPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for user authentication
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          const res = await axios.get('http://localhost:5000/api/auth/user', {
            headers: {
              'x-auth-token': token
            }
          });
          
          setUser(res.data);
        } catch (err) {
          localStorage.removeItem('token');
        }
      }
      
      setLoading(false);
    };
    
    fetchUser();

    // Initialize particles.js
    if (window.particlesJS) {
      window.particlesJS("particles-js", {
        "particles": {
          "number": {
            "value": 80,
            "density": {
              "enable": true,
              "value_area": 800
            }
          },
          "color": {
            "value": "#5e5e5e" 
          },
          "shape": {
            "type": "circle",
            "stroke": {
              "width": 0,
              "color": "#000000"
            },
            "polygon": {
              "nb_sides": 5
            }
          },
          "opacity": {
            "value": 0.3,
            "random": false,
            "anim": {
              "enable": false,
              "speed": 1,
              "opacity_min": 0.1,
              "sync": false
            }
          },
          "size": {
            "value": 3,
            "random": true,
            "anim": {
              "enable": false,
              "speed": 40,
              "size_min": 0.1,
              "sync": false
            }
          },
          "line_linked": {
            "enable": true,
            "distance": 150,
            "color": "#5e5e5e",
            "opacity": 0.2,
            "width": 1
          },
          "move": {
            "enable": true,
            "speed": 2,
            "direction": "none",
            "random": false,
            "straight": false,
            "out_mode": "out",
            "bounce": false,
            "attract": {
              "enable": false,
              "rotateX": 600,
              "rotateY": 1200
            }
          }
        },
        "interactivity": {
          "detect_on": "canvas",
          "events": {
            "onhover": {
              "enable": true,
              "mode": "grab"
            },
            "onclick": {
              "enable": true,
              "mode": "push"
            },
            "resize": true
          },
          "modes": {
            "grab": {
              "distance": 140,
              "line_linked": {
                "opacity": 0.6
              }
            },
            "bubble": {
              "distance": 400,
              "size": 40,
              "duration": 2,
              "opacity": 8,
              "speed": 3
            },
            "repulse": {
              "distance": 200,
              "duration": 0.4
            },
            "push": {
              "particles_nb": 4
            },
            "remove": {
              "particles_nb": 2
            }
          }
        },
        "retina_detect": true
      });
    }

    // Setup modal functionality
    const setupModals = () => {
      const aboutLink = document.getElementById("about-link");
      const teamLink = document.getElementById("team-link");
      const termsLink = document.getElementById("terms-link");
      const privacyLink = document.getElementById("privacy-link");
      
      const aboutModal = document.getElementById("about-modal");
      const teamModal = document.getElementById("team-modal");
      const termsModal = document.getElementById("terms-modal");
      const privacyModal = document.getElementById("privacy-modal");
      
      const closeButtons = document.querySelectorAll(".close-button");
      
      if (aboutLink) {
        aboutLink.addEventListener('click', function(e) {
          e.preventDefault();
          aboutModal.style.display = "block";
        });
      }
      
      if (teamLink) {
        teamLink.addEventListener('click', function(e) {
          e.preventDefault();
          teamModal.style.display = "block";
        });
      }
      
      if (termsLink) {
        termsLink.addEventListener('click', function(e) {
          e.preventDefault();
          termsModal.style.display = "block";
        });
      }
      
      if (privacyLink) {
        privacyLink.addEventListener('click', function(e) {
          e.preventDefault();
          privacyModal.style.display = "block";
        });
      }
      
      closeButtons.forEach(function(button) {
        button.addEventListener('click', function() {
          const modal = this.closest('.modal');
          if (modal) {
            modal.style.display = "none";
          }
        });
      });
      
      window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
          event.target.style.display = "none";
        }
      });
    };

    // Setup search and tags
    const setupSearchAndTags = () => {
      const tags = document.querySelectorAll(".tag-container .tag");
      const algoBoxes = document.querySelectorAll(".algo-box");
      const searchInput = document.querySelector('.search-container input');

      let activeTag = null;

      tags.forEach(tag => {
        tag.addEventListener("click", () => {
          if (tag === activeTag) {
            tag.classList.remove("active");
            activeTag = null;
            showAll();
          } else {
            tags.forEach(t => t.classList.remove("active"));
            tag.classList.add("active");
            activeTag = tag;
            filterByTag(tag.innerText.toLowerCase());
          }
        });
      });

      function filterByTag(tagText) {
        algoBoxes.forEach(box => {
          const tagsInBox = Array.from(box.querySelectorAll(".algo-tags .tag")).map(t => t.innerText.toLowerCase());
          box.style.display = tagsInBox.includes(tagText) ? "block" : "none";
        });
      }

      function showAll() {
        algoBoxes.forEach(box => {
          box.style.display = "block";
        });
      }

      if (searchInput) {
        searchInput.addEventListener("input", () => {
          const searchTerm = searchInput.value.toLowerCase();
          algoBoxes.forEach(box => {
            const title = box.querySelector(".algo-title")?.innerText.toLowerCase() || "";
            const tagsInBox = Array.from(box.querySelectorAll(".algo-tags .tag")).map(t => t.innerText.toLowerCase());
            const combinedText = title + " " + tagsInBox.join(" ");
            box.style.display = combinedText.includes(searchTerm) ? "block" : "none";
          });
        });
      }
    };

    // Setup stars
    const setupStars = () => {
      const stars = document.querySelectorAll('.star-icon');

      stars.forEach(star => {
        star.addEventListener('click', function () {
          star.classList.toggle('selected');
        });
      });
    };

    // Wait for DOM to be fully loaded before applying JS
    setTimeout(() => {
      setupModals();
      setupSearchAndTags();
      setupStars();
    }, 100);

    // Cleanup function
    return () => {
      // Any cleanup if needed when component unmounts
    };
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    // Stay on landing page after logout
  };

  const goToProfile = () => {
    navigate('/profile');
  };

  return (
    <>
      <div id="particles-js"></div>

      <div id='main-container'>
      <nav id="navbar">
        <div id="left-logo"><a href="/" id="logo"></a>
            <span id="logo">
                <span className="logo-white">Algo</span><span className="logo-blue">Lens</span><small>.NET</small>
            </span>
        </div>
        
        {loading ? (
            <div className="loading-auth">Loading...</div>
        ) : user ? (
            <div className="user-nav-container">
                <span className="username-display">{user.username}</span>
                <button className="profile-btn" onClick={goToProfile}>PROFILE</button>
            </div>
        ) : (
            <Link to="/login">
                <button id="right-login">LOGIN</button>
            </Link>
        )}
        </nav>

        <div id="space-before"></div>

        <main>
          <div className="title-container">
            <h3 id="title">
              <span className="title-black">Algo</span><span className="title-blue">Lens</span>
            </h3>
            <p className="subtitle">visualising data structures and algorithms through animation</p>
          </div>

          <div id="space-before"></div>

          <div className="search-container">
            <form>
              <div className="ketaki-container">
                <input type="text" name="search" placeholder="What are you looking for?" required />
                <button type="submit"><span className="material-symbols-outlined search">search</span></button>
              </div>
            </form>
          </div>

          <div className="tag-container">
            <span className="tag" id="backtracking">backtracking</span>
            <span className="tag" id="branch">branch & bound</span>
            <span className="tag" id="brute">brute force</span>
            <span className="tag" id="divide">divide & conquer</span>
            <span className="tag" id="dynamic">dynamic</span>
            <span className="tag" id="greedy">greedy</span>
            <span className="tag" id="sorting">sorting</span>
            <span className="tag" id="graphs">graphs</span>
          </div>

          <div id="space-before"></div>

          <div className="all-algos-container">
            {/* Original Algorithm Boxes */}
            <div className="algo-box" id="merge">
              <Link to="/visualizer/merge">
                <div className="algo-image">
                  <img src={comingSoon} alt="Merge Sort" style={{ width: '100%', height: '100%' }} />
                </div>
              </Link>
              
              <div className="algo-title">
                <Link to="/visualizer/merge" style={{ textDecoration: 'none', color: 'inherit' }}>Merge Sort</Link>
                <span className="material-symbols-outlined star-icon">kid_star</span>
              </div>

              <div className="algo-tags">
                <span className="tag">sorting</span>
                <span className="tag">merge sort</span>
                <span className="tag">divide & conquer</span>
              </div>
            </div>

            <div className="algo-box" id="quick">
              <Link to="/visualizer/quick">
                <div className="algo-image">
                  <img src={comingSoon} alt="Quick Sort" style={{ width: '100%', height: '100%' }} />
                </div>
              </Link>

              <div className="algo-title">
                <Link to="/visualizer/quick" style={{ textDecoration: 'none', color: 'inherit' }}>Quick Sort</Link>
                <span className="material-symbols-outlined star-icon">kid_star</span>
              </div>

              <div className="algo-tags">
                <span className="tag">sorting</span>
                <span className="tag">quick sort</span>
                <span className="tag">divide & conquer</span>
              </div>
            </div>

            <div className="algo-box" id="floyd">
              <Link to="/visualizer/floyd">
                <div className="algo-image">
                  <img src={comingSoon} alt="Floyd Warshalls" style={{ width: '100%', height: '100%' }} />  
                </div>
              </Link>

              <div className="algo-title">
                <Link to="/visualizer/floyd" style={{ textDecoration: 'none', color: 'inherit' }}>Floyd Warshall</Link>
                <span className="material-symbols-outlined star-icon">kid_star</span>
              </div>

              <div className="algo-tags">
                <span className="tag">dynamic</span>
                <span className="tag">floyd warshall</span>
                <span className="tag">shortest path</span>
                <span className="tag">graphs</span>
              </div>
            </div>

            <div className="algo-box" id="knapsack">
              <Link to="/algorithms/knapsack">
                <div className="algo-image">
                  <img src={knapsack} alt="Knapsack" style={{ width: '100%', height: '100%' }} />  
                </div>
              </Link>

              <div className="algo-title">
                <Link to="/algorithms/knapsack" style={{ textDecoration: 'none', color: 'inherit' }}>Knapsack</Link>
                <span className="material-symbols-outlined star-icon">kid_star</span>
              </div>

              <div className="algo-tags">
                <span className="tag">knapsack</span>
                <span className="tag">dynamic</span>
                <span className="tag">greedy</span>
              </div>
            </div>

            <div className="algo-box" id="sos">
              <Link to="/visualizer/subset">
                <div className="algo-image">
                  <img src={comingSoon} alt="Sum of Subsets" style={{ width: '100%', height: '100%' }}/>  
                </div>
              </Link>

              <div className="algo-title">
                <Link to="/visualizer/subset" style={{ textDecoration: 'none', color: 'inherit' }}>Sum of Subsets</Link>
                <span className="material-symbols-outlined star-icon">kid_star</span>
              </div>

              <div className="algo-tags">
                <span className="tag">subset sum</span>
                <span className="tag">backtracking</span>
              </div>
            </div>

            {/* Updated Algorithm Boxes with correct routes */}
            <div className="algo-box" id="binary">
              <Link to="/algorithms/binary">
                <div className="algo-image">
                  <img src={merge} alt="Binary Search" style={{ width: '100%', height: '100%' }} />
                </div>
              </Link>

              <div className="algo-title">
                <Link to="/algorithms/binary" style={{ textDecoration: 'none', color: 'inherit' }}>Binary Search</Link>
                <span className="material-symbols-outlined star-icon">kid_star</span>
              </div>

              <div className="algo-tags">
                <span className="tag">search</span>
                <span className="tag">binary search</span>
                <span className="tag">divide & conquer</span>
              </div>
            </div>

            <div className="algo-box" id="bubble">
              <Link to="/algorithms/bubble">
                <div className="algo-image">
                  <img src={quick} alt="Bubble Sort" style={{ width: '100%', height: '100%' }} />
                </div>
              </Link>

              <div className="algo-title">
                <Link to="/algorithms/bubble" style={{ textDecoration: 'none', color: 'inherit' }}>Bubble Sort</Link>
                <span className="material-symbols-outlined star-icon">kid_star</span>
              </div>

              <div className="algo-tags">
                <span className="tag">sorting</span>
                <span className="tag">bubble sort</span>
                <span className="tag">brute force</span>
              </div>
            </div>

            <div className="algo-box" id="nqueen">
              <Link to="/algorithms/nqueens">
                <div className="algo-image">
                  <img src={nqueen} alt="N-Queens" style={{ width: '100%', height: '100%' }} />
                </div>
              </Link>

              <div className="algo-title">
                <Link to="/algorithms/nqueens" style={{ textDecoration: 'none', color: 'inherit' }}>N-Queens Problem</Link>
                <span className="material-symbols-outlined star-icon">kid_star</span>
              </div>

              <div className="algo-tags">
                <span className="tag">backtracking</span>
                <span className="tag">nqueens</span>
              </div>
            </div>

            <div className="algo-box" id="dijkstra">
              <Link to="/dijkstra">
                <div className="algo-image">
                  <img src={graphs} alt="Dijkstra Algorithm" style={{ width: '100%', height: '100%' }} />
                </div>
              </Link>

              <div className="algo-title">
                <Link to="/dijkstra" style={{ textDecoration: 'none', color: 'inherit' }}>Dijkstra Algorithm</Link>
                <span className="material-symbols-outlined star-icon">kid_star</span>
              </div>

              <div className="algo-tags">
                <span className="tag">greedy</span>
                <span className="tag">shortest path</span>
                <span className="tag">graphs</span>
              </div>
            </div>

            <div className="algo-box" id="selection">
              <Link to="/algorithms/selection">
                <div className="algo-image">
                  <img src={selection} alt="Selection Sort" style={{ width: '100%', height: '100%' }} />
                </div>
              </Link>

              <div className="algo-title">
                <Link to="/algorithms/selection" style={{ textDecoration: 'none', color: 'inherit' }}>Selection Sort</Link>
                <span className="material-symbols-outlined star-icon">kid_star</span>
              </div>

              <div className="algo-tags">
                <span className="tag">sorting</span>
                <span className="tag">selection sort</span>
                <span className="tag">brute force</span>
              </div>
            </div>

            <div className="algo-box" id="dfs">
              <Link to="/visualizer/dfs">
                <div className="algo-image">
                  <img src={comingSoon} alt="DFS Coming Soon" style={{ width: '100%', height: '100%' }} />
                </div>
              </Link>

              <div className="algo-title">
                <Link to="/visualizer/dfs" style={{ textDecoration: 'none', color: 'inherit' }}>Depth First Search</Link>
                <span className="material-symbols-outlined star-icon">kid_star</span>
              </div>

              <div className="algo-tags">
                <span className="tag">graphs</span>
                <span className="tag">traversal</span>
                <span className="tag">search</span>
              </div>
            </div>
          </div>
        </main>
      </div>

      <footer className="footer">
        <div className="footer-content">
          <a href="#" id="about-link" className="footer-link">About</a>
          <a href="#" id="team-link" className="footer-link">Team</a>
          <a href="#" id="terms-link" className="footer-link">Terms of Use</a>
          <a href="#" id="privacy-link" className="footer-link">Privacy Policy</a>
        </div>
      </footer>

      {/* Modals */}
      <div id="about-modal" className="modal">
        <div className="modal-content">
          <div className="modal-header">
            <h2>ABOUT</h2>
            <span className="close-button">&times;</span>
          </div>
          <div className="modal-body">
            <p>AlgoLens is an educational platform designed to visualize algorithms and data structures, making complex computer science concepts easier to understand through interactive animations.</p>
          </div>
        </div>
      </div>

      <div id="team-modal" className="modal">
        <div className="modal-content">
          <div className="modal-header">
            <h2>TEAM</h2>
            <span className="close-button" data-modal="team-modal">&times;</span>
          </div>
          <div className="modal-body">
            <p>Our team consists of passionate educators and developers dedicated to making algorithm visualization accessible to everyone.</p>
            <p>Core Team:</p>
            <ul>
              <li><strong>Meetali Neve</strong> - Lead Developer</li>
              <li><strong>Ketaki Mahajan</strong> - UI/UX Designer</li>
              <li><strong>Ibraheem Mir</strong> - Algorithm Specialist</li>
            </ul>
            <p>We are constantly working to improve AlgoLens and bring new visualizations to help students understand complex algorithms.</p>
          </div>
        </div>
      </div>

      <div id="terms-modal" className="modal">
        <div className="modal-content">
          <div className="modal-header">
            <h2>TERMS OF USE</h2>
            <span className="close-button" data-modal="terms-modal">&times;</span>
          </div>
          <div className="modal-body">
            <p>Terms of use content will go here.</p>
          </div>
        </div>
      </div>

      <div id="privacy-modal" className="modal">
        <div className="modal-content">
          <div className="modal-header">
            <h2>PRIVACY POLICY</h2>
            <span className="close-button" data-modal="privacy-modal">&times;</span>
          </div>
          <div className="modal-body">
            <p>Privacy policy content will go here.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LandingPage;