type Profile = {
  name: string;
};

function renderProfile(profile: Profile) {
  return profile.name;
}

renderProfile(JSON.parse("{}"));

export {};
