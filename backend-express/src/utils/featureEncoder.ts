export function encodeProfileToFeatures(profile: any): number[] {
  const educationMap: { [key: string]: number } = {
    "Ensino Fundamental": 0,
    "Ensino Médio": 1,
    "Ensino Superior": 2,
    "Pós-graduação": 3,
    "Mestrado": 4,
    "Doutorado": 5,
    "Técnico": 6,
    "Cursos Livres": 7,
  };
  const areaMap: { [key: string]: number } = {
    "Tecnologia da Informação": 4,
    "Negócios e Administração": 9,
    "Design e Artes Visuais": 13,
  };
  const audienceMap = {
    "Jovens (18-25)": 0,
    "Adultos (26-35)": 1,
    "Profissionais (36-50)": 2,
    "Empresários": 3,
  };
  return [
    educationMap[String(profile.education)] || 0,
    areaMap[String(profile.educationArea)] || 0,
    profile.investment,
    profile.timeAvailable,
    profile.hobbies.length / 15,
    profile.audience.length / 8,
  ];
}