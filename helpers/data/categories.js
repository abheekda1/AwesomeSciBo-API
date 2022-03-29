categories = [
    {
      "name": "Earth and Space",
      "subcategories": [
        "General",
        "Astrophysics",
        "Cosmology",
        "Planetary Astronomy",
        "Meteorology",
        "Oceanography",
        "Geology"
      ]
    },
    {
      "name": "Physics",
      "subcategories": [
        "General",
        "Kinematics",
        "Rotational Motion",
        "Simple Harmonic Motion",
        "Electrostatics"
      ]
    },
    {
      "name": "Biology",
      "subcategories": [
        "General",
        "Cell Biology",
        "Biochemistry",
        "Genetics",
        "Biotechnology",
        "Evolution",
        "Ecology",
        "Plant Biology",
        "Phylogeny",
        "Microbiology"
      ]
    },
    {
      "name": "Chemistry",
      "subcategories": [
        "General",
        "Electrochemistry",
        "Reactions",
        "Bonding",
        "Qualitative Analysis",
        "Equilibrium",
        "Kinetics",
        "Nuclear Chemistry",
        "Thermochemistry",
        "Organic Chemistry",
        "Physical Chemistry",
        "Analytical Chemistry",
        "Quantum Chemistry",
        "Laboratory Chemistry"
      ]
    }
]

const categoryNames = [];
categories.forEach(category => {
  categoryNames.push(category.name);
});

const subCategoryNames = [];
categories.forEach(category => {
  category.subcategories.forEach(subcategory => {
    subCategoryNames.push(subcategory);
  });
});

module.exports.categoryNames = categoryNames;
module.exports.subCategoryNames = subCategoryNames;
module.exports.categories = categories;