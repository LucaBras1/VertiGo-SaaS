/**
 * GigBook Booking Widget
 * Embeddable booking form script
 *
 * Usage:
 * <script src="https://app.gigbook.cz/widget.js" data-token="YOUR_TOKEN"></script>
 */

(function() {
  'use strict';

  // Find the script tag with our token
  const scripts = document.getElementsByTagName('script');
  let token = null;
  let targetElement = null;

  for (let i = 0; i < scripts.length; i++) {
    const script = scripts[i];
    if (script.src && script.src.includes('widget.js') && script.dataset.token) {
      token = script.dataset.token;
      targetElement = script;
      break;
    }
  }

  if (!token) {
    console.error('GigBook Widget: No token found. Please add data-token attribute.');
    return;
  }

  // Get the base URL from the script src
  const scriptSrc = targetElement.src;
  const baseUrl = scriptSrc.substring(0, scriptSrc.lastIndexOf('/'));

  // Create iframe container
  const container = document.createElement('div');
  container.id = 'gigbook-widget-container';
  container.style.cssText = 'width: 100%; max-width: 100%;';

  // Create iframe
  const iframe = document.createElement('iframe');
  iframe.id = 'gigbook-widget-iframe';
  iframe.src = `${baseUrl}/book/${token}`;
  iframe.style.cssText = `
    width: 100%;
    height: 800px;
    border: none;
    border-radius: 16px;
    overflow: hidden;
  `;
  iframe.setAttribute('frameborder', '0');
  iframe.setAttribute('scrolling', 'auto');
  iframe.setAttribute('allowtransparency', 'true');

  // Listen for height adjustments from iframe
  window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'gigbook-widget-resize') {
      iframe.style.height = event.data.height + 'px';
    }
  });

  container.appendChild(iframe);

  // Insert after the script tag
  targetElement.parentNode.insertBefore(container, targetElement.nextSibling);
})();
