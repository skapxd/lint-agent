type Profile = {
  name: string;
};

declare const ProfileSchema: {
  parse(value: unknown): Profile;
};

function renderProfile(profile: Profile) {
  return profile.name;
}

const payload: unknown = JSON.parse("{}");

renderProfile(ProfileSchema.parse(payload));

export {};
