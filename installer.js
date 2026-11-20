const releaseSelect = document.querySelector('#release');
const profileSelect = document.querySelector('#profile');
const connection = document.querySelector('#connection');
const status = document.querySelector('#status');
const installer = document.querySelector('esp-web-install-button');

async function loadCatalog() {
  try {
    const response = await fetch('catalog.json', { cache: 'no-cache' });
    if (!response.ok) throw new Error('Catalog unavailable');
    const releases = await response.json();
    if (!releases.length) {
      status.textContent = 'No firmware releases are available yet.';
      return;
    }

    releases.forEach(({ version }, index) => {
      releaseSelect.add(new Option(index === 0 ? `Latest · ${version}` : version, version));
    });

    function updateInstaller() {
      const release = releases[releaseSelect.selectedIndex];
      const profile = release.profiles[profileSelect.selectedIndex];
      connection.textContent = profile.connection;
      installer.manifest = new URL(profile.manifest, document.baseURI).href;
      installer.hidden = false;
    }

    function updateProfiles() {
      const release = releases[releaseSelect.selectedIndex];
      const previous = profileSelect.value;
      profileSelect.replaceChildren(...release.profiles.map(
        ({ id, label }) => new Option(label, id),
      ));
      if (release.profiles.some(({ id }) => id === previous)) profileSelect.value = previous;
      updateInstaller();
    }

    await Promise.race([
      customElements.whenDefined('esp-web-install-button'),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Installer unavailable')), 10000)),
    ]);
    releaseSelect.disabled = false;
    profileSelect.disabled = false;
    releaseSelect.addEventListener('change', updateProfiles);
    profileSelect.addEventListener('change', updateInstaller);
    updateProfiles();
    status.hidden = true;
  } catch {
    status.textContent = 'The installer could not load. Reload the page or use the GitHub downloads below.';
  }
}

loadCatalog();
