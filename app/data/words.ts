export interface Category {
  id: string
  name: string
  words: string[]
}

export const CATEGORIES: Record<'en' | 'km', Category[]> = {
  en: [
    {
      id: 'animals',
      name: '🐾 Animals',
      words: ['Cat', 'Dog', 'Elephant', 'Lion', 'Tiger', 'Penguin', 'Dolphin', 'Monkey', 'Zebra', 'Crocodile', 'Bear', 'Wolf', 'Rabbit', 'Fox', 'Owl', 'Parrot', 'Cheetah', 'Gorilla'],
    },
    {
      id: 'food',
      name: '🍕 Food',
      words: ['Pizza', 'Sushi', 'Burger', 'Pasta', 'Tacos', 'Ramen', 'Salad', 'Cake', 'Soup', 'Sandwich', 'Ice Cream', 'Steak', 'Donut', 'Pancakes', 'Fried Rice', 'Curry', 'Noodles', 'Chocolate'],
    },
    {
      id: 'places',
      name: '🏔️ Places',
      words: ['Beach', 'Mountain', 'Forest', 'Desert', 'Airport', 'Hospital', 'School', 'Market', 'Museum', 'Library', 'Stadium', 'Park', 'Zoo', 'Farm', 'Castle', 'Cave', 'Lighthouse', 'Volcano'],
    },
    {
      id: 'professions',
      name: '👨‍💼 Professions',
      words: ['Doctor', 'Teacher', 'Chef', 'Pilot', 'Firefighter', 'Police', 'Engineer', 'Farmer', 'Artist', 'Nurse', 'Lawyer', 'Scientist', 'Journalist', 'Dentist', 'Astronaut', 'Mechanic', 'Magician', 'Sailor'],
    },
    {
      id: 'sports',
      name: '⚽ Sports',
      words: ['Football', 'Basketball', 'Tennis', 'Swimming', 'Cycling', 'Boxing', 'Volleyball', 'Golf', 'Badminton', 'Wrestling', 'Archery', 'Skiing', 'Baseball', 'Cricket', 'Rugby', 'Surfing', 'Gymnastics', 'Fencing'],
    },
    {
      id: 'objects',
      name: '🎸 Objects',
      words: ['Umbrella', 'Camera', 'Guitar', 'Bicycle', 'Clock', 'Mirror', 'Scissors', 'Candle', 'Compass', 'Telescope', 'Lantern', 'Suitcase', 'Keyboard', 'Microscope', 'Ladder', 'Parachute', 'Binoculars', 'Map'],
    },
  ],
  km: [
    {
      id: 'animals',
      name: '🐾 សត្វ',
      words: ['ឆ្មា', 'ឆ្កែ', 'ដំរី', 'ខ្លា', 'ស្វា', 'ពស់', 'ទា', 'ក្ដាម', 'ត្រី', 'គោ', 'ជ្រូក', 'ពពែ', 'មាន់', 'ទន្សាយ', 'ក្អែក', 'ក្ត្រង', 'ខ្លានី', 'ទទឹម'],
    },
    {
      id: 'food',
      name: '🍚 អាហារ',
      words: ['បាយ', 'នំ', 'ចេក', 'ស្វាយ', 'ក្រូច', 'ត្រីអាំង', 'នំបញ្ចុក', 'ស្ករ', 'ស្ងោ', 'ភ្លៅ', 'ម្ទេស', 'ខ្ទឹម', 'ត្រពាំង', 'ទឹកដោះ', 'នំបុ័ង', 'ស្ពៃ', 'ផ្លែឈើ', 'ស្ករត្នោត'],
    },
    {
      id: 'places',
      name: '🏔️ ទីកន្លែង',
      words: ['ភ្នំ', 'ផ្សារ', 'ព្រៃ', 'ទន្លេ', 'ក្រុង', 'ភូមិ', 'ស្ពាន', 'វត្ត', 'ពេទ្យ', 'សាលារៀន', 'ព្រលានយន្ត', 'ស្ថានីយ', 'ឆ្នេរ', 'ទំនប់', 'ឆ្នេរសមុទ្រ'],
    },
    {
      id: 'professions',
      name: '👨‍💼 មុខរបរ',
      words: ['គ្រូ', 'ពេទ្យ', 'ប៉ូលីស', 'ទាហាន', 'ចុងភៅ', 'ជាង', 'កសិករ', 'អ្នកបើកបរ', 'ជំនួញ', 'ចៅក្រម', 'ជាងកាត់', 'ចម្លង', 'ស្ថបនិក', 'មេធាវី', 'អ្នករចនា'],
    },
    {
      id: 'sports',
      name: '⚽ កីឡា',
      words: ['បាល់ទាត់', 'បាល់បោះ', 'ប្រដាល់', 'ហែលទឹក', 'ជិះកង់', 'ប្រណាំង', 'វ៉ូលីបល', 'ក្ដែង', 'ប្រណាំងទូក', 'ធ្នូ', 'ជើងឆ្ងាយ', 'លោតខ្ពស់', 'រត់', 'យូហ្គា', 'ឡើងភ្នំ'],
    },
    {
      id: 'objects',
      name: '🎸 វត្ថុ',
      words: ['ឆ័ត', 'ម៉ាស៊ីនថត', 'ហ្គីតា', 'កង់', 'នាឡិកា', 'កញ្ចក់', 'កន្ត្រៃ', 'ទៀន', 'ទូរស័ព្ទ', 'ប៊ិច', 'សៀវភៅ', 'ចង្ក្រាន', 'ឆ្នាំង', 'កាបូប', 'ម៉ូតូ'],
    },
  ],
}
