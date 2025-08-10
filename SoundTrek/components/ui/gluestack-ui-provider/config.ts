'use client';
import { vars } from 'nativewind';

export const config = {
  light: vars({
    /* Primary */
    '--color-primary-0':   '227 255 158',         // #e3ff9e
    '--color-primary-50':  '202 239 110',         // #c4eb63
    '--color-primary-100': '172 218 55',          // #9CCF1B
    '--color-primary-200': '144 193 25',          // #7EAC16
    '--color-primary-300': '119 163 20',          // #5D800C
    '--color-primary-400': '93 128 12',           // #4D6B20
    '--color-primary-500': '80 111 28',           // #2f4212
    '--color-primary-600': '58 82 23',            // #182D1A
    '--color-primary-700': '22 41 21',            // #162915
    '--color-primary-800': '37 57 21',            // #111b02
    '--color-primary-950': '17 27 2',             // #111B02

    /* Secondary  */
    '--color-secondary-0':   '243 255 225',       // #f3ffe1
    '--color-secondary-50':  '235 252 206',       // #ebfccc
    '--color-secondary-100': '225 244 180',       // #e1f4b4
    '--color-secondary-200': '210 232 160',       // #d2e8a0
    '--color-secondary-300': '190 217 139',       // #bed98b
    '--color-secondary-400': '167 194 120',       // #a7c278
    '--color-secondary-500': '144 167 100',       // #90a764
    '--color-secondary-600': '122 144 84',        // #7a9054
    '--color-secondary-700': '104 122 70',        // #687a46
    '--color-secondary-800': '87 103 56',         // #576738
    '--color-secondary-900': '69 82 44',          // #45522c
    '--color-secondary-950': '55 65 33',          // #374121

    /* Tertiary */
    '--color-tertiary-0':   '227 255 158',        // #e3ff9e
    '--color-tertiary-50':  '196 235 99',         // #c4eb63
    '--color-tertiary-100': '156 207 27',         // #9ccf1b
    '--color-tertiary-200': '126 172 22',         // #7eac16
    '--color-tertiary-300': '93 128 12',          // #5d800c
    '--color-tertiary-400': '77 107 32',          // #4d6b20
    '--color-tertiary-500': '47 66 18',           // #2f4212
    '--color-tertiary-600': '24 45 26',           // #182d1a
    '--color-tertiary-700': '17 27 2',            // #111b02
    '--color-tertiary-800': '14 22 2',            // #0E1602
    '--color-tertiary-900': '10 16 1',            // #0A1001
    '--color-tertiary-950': '5 10 0',             // #050a00

    /* Error */
    '--color-error-0':   '255 240 240',           // #fff0f0
    '--color-error-50':  '255 225 225',           // #ffe1e1
    '--color-error-100': '255 204 204',           // #ffcccc
    '--color-error-200': '255 153 153',           // #ff9999
    '--color-error-300': '255 102 102',           // #ff6666
    '--color-error-400': '240 80 80',             // #f05050
    '--color-error-500': '225 55 55',             // #e13737
    '--color-error-600': '200 40 40',             // #c82828
    '--color-error-700': '165 30 30',             // #a51e1e
    '--color-error-800': '130 25 25',             // #821919
    '--color-error-900': '95 20 20',              // #5f1414
    '--color-error-950': '60 15 15',              // #3c0f0f

    /* Success */
    '--color-success-0':   '227 255 158',         // #e3ff9e
    '--color-success-50':  '196 235 99',          // #c4eb63
    '--color-success-100': '156 207 27',          // #9CCF1B
    '--color-success-200': '126 172 22',          // #7EAC16
    '--color-success-300': '93 128 12',           // #5D800C
    '--color-success-400': '77 107 32',           // #4D6B20
    '--color-success-500': '47 66 18',            // #2f4212
    '--color-success-600': '24 45 24',            // #182D1A
    '--color-success-700': '17 27 2',             // #111b02
    '--color-success-800': '14 22 2',             // #0e1602 
    '--color-success-900': '10 17 1',             // #0a1101
    '--color-success-950': '6 10 0',              // #060a00 

    /* Warning */
    '--color-warning-0':   '255 255 245',         // #fffff5
    '--color-warning-50':  '243 255 197',         // #f3ffc5
    '--color-warning-100': '227 255 158',         // #e3ff9e
    '--color-warning-200': '196 235 99',          // #c4eb63
    '--color-warning-300': '156 207 27',          // #9CCF1B
    '--color-warning-400': '126 172 22',          // #7EAC16
    '--color-warning-500': '93 128 12',           // #5D800C
    '--color-warning-600': '77 107 32',           // #4D6B20
    '--color-warning-700': '47 66 18',            // #2f4212
    '--color-warning-800': '24 45 24',            // #182D1A
    '--color-warning-900': '17 27 2',             // #111b02
    '--color-warning-950': '14 22 2',             // #0e1602

    /* Info */
    '--color-info-0':   '236 248 254',            // #ecf8fe
    '--color-info-50':  '199 235 252',            // #c7ebfc
    '--color-info-100': '162 221 250',            // #a2ddfa
    '--color-info-200': '124 207 248',            // #7ccff8
    '--color-info-300': '87 194 246',             // #57c2f6
    '--color-info-400': '50 180 244',             // #32b4f4
    '--color-info-500': '13 166 242',             // #0da6f2
    '--color-info-600': '11 141 205',             // #0b8dcd
    '--color-info-700': '9 115 168',              // #0973a8
    '--color-info-800': '7 90 131',               // #075a83
    '--color-info-900': '5 64 93',                // #05405d
    '--color-info-950': '3 38 56',                // #032638

    /* Typography */
    '--color-typography-0':   '254 254 255',      // #fefeff
    '--color-typography-50':  '245 245 245',      // #f5f5f5
    '--color-typography-100': '229 229 229',      // #e5e5e5
    '--color-typography-200': '219 219 220',      // #dbdbdc
    '--color-typography-300': '212 212 212',      // #d4d4d4
    '--color-typography-400': '163 163 163',      // #a3a3a3
    '--color-typography-500': '140 140 140',      // #8c8c8c
    '--color-typography-600': '115 115 115',      // #737373
    '--color-typography-700': '82 82 82',         // #525252
    '--color-typography-800': '64 64 64',         // #404040
    '--color-typography-900': '38 38 39',         // #262627
    '--color-typography-950': '23 23 23',         // #171717

    /* Outline */
    '--color-outline-0':   '253 254 254',         // #fdfefe
    '--color-outline-50':  '243 243 243',         // #f3f3f3
    '--color-outline-100': '230 230 230',         // #e6e6e6
    '--color-outline-200': '221 220 219',         // #dddccb
    '--color-outline-300': '211 211 211',         // #d3d3d3
    '--color-outline-400': '165 163 163',         // #a5a3a3
    '--color-outline-500': '140 141 141',         // #8c8d8d
    '--color-outline-600': '115 116 116',         // #737474
    '--color-outline-700': '83 82 82',            // #535252
    '--color-outline-800': '65 65 65',            // #414141
    '--color-outline-900': '39 38 36',            // #272624
    '--color-outline-950': '26 23 23',            // #1a1717

    /* Background */
    '--color-background-0':   '255 255 255',      // #ffffff
    '--color-background-50':  '235 252 206',      // #ebfccc
    '--color-background-100':  '212 243 120',     // #d4f378
    '--color-background-200': '196 235 99',       // #c4eb63
    '--color-background-300': '178 222 63',       // #b2de3f
    '--color-background-400': '156 207 27',       // #9ccf1b
    '--color-background-500': '141 180 22',       // #8db416
    '--color-background-600': '104 148 17',       // #689411
    '--color-background-700': '93 128 12',        // #5d800c
    '--color-background-800': '77 107 32',        // #4d6b20
    '--color-background-900': '47 66 18',         // #2f4212
    '--color-background-950': '17 27 2',          // #111b02

    /* Background Special */
    '--color-background-error':   '255 153 153',  // #ff9999
    '--color-background-warning': '255 219 133',  // #ffdb85
    '--color-background-success': '196 235 99',   // #c4eb63
    '--color-background-muted':   '210 230 190',  // #d2e6be
    '--color-background-info':    '178 233 255',  // #b2e9ff

    /* Focus Ring Indicator  */
    '--color-indicator-primary':  '227 255 158',  // #e3ff9e
    '--color-indicator-info':     '178 233 255',  // #b2e9ff
    '--color-indicator-error':    '255 153 153',  // #ff9999
  }),

  
  dark: vars({
    /* Primary */
    '--color-primary-0':   '153 179 101',         // #99b365
    '--color-primary-50':  '130 160 80',          // #82a050
    '--color-primary-100': '107 140 60',          // #6b8c3c
    '--color-primary-200': '84 120 44',           // #54782c
    '--color-primary-300': '65 100 30',           // #41641e
    '--color-primary-400': '52 80 24',            // #345018
    '--color-primary-500': '37 60 17',            // #253c11
    '--color-primary-600': '27 45 14',            // #1b2d0e
    '--color-primary-700': '19 32 10',            // #13200a
    '--color-primary-800': '14 23 7',             // #0e1707
    '--color-primary-900': '10 15 4',             // #0a0f04
    '--color-primary-950': '6 10 2',              // #060a02

    /* Secondary  */
    '--color-secondary-0':   '55 65 33',          // #374121
    '--color-secondary-50':  '69 82 44',          // #45522c
    '--color-secondary-100': '87 103 56',         // #576738
    '--color-secondary-200': '104 122 70',        // #687a46
    '--color-secondary-300': '122 144 84',        // #7a9054
    '--color-secondary-400': '144 167 100',       // #90a764
    '--color-secondary-500': '167 194 120',       // #a7c278
    '--color-secondary-600': '190 217 139',       // #bed98b
    '--color-secondary-700': '210 232 160',       // #d2e8a0
    '--color-secondary-800': '225 244 180',       // #e1f4b4
    '--color-secondary-900': '235 252 206',       // #ebfccc
    '--color-secondary-950': '243 255 225',       // #f3ffe1

    /* Tertiary */
    '--color-tertiary-0':   '5 10 0',             // #050a00
    '--color-tertiary-50':  '10 16 1',            // #0a1001
    '--color-tertiary-100': '14 22 2',            // #0e1602
    '--color-tertiary-200': '17 27 2',            // #111b02
    '--color-tertiary-300': '24 45 26',           // #182d1a
    '--color-tertiary-400': '47 66 18',           // #2f4212
    '--color-tertiary-500': '77 107 32',          // #4d6b20
    '--color-tertiary-600': '93 128 12',          // #5d800c
    '--color-tertiary-700': '126 172 22',         // #7eac16
    '--color-tertiary-800': '156 207 27',         // #9ccf1b
    '--color-tertiary-900': '196 235 99',         // #c4eb63
    '--color-tertiary-950': '227 255 158',        // #e3ff9e

    /* Error */
    '--color-error-0':   '83 19 19',              // #531313
    '--color-error-50':  '127 29 29',             // #7f1d1d
    '--color-error-100': '153 27 27',             // #991b1b
    '--color-error-200': '185 28 28',             // #b91c1c
    '--color-error-300': '220 38 38',             // #dc2626
    '--color-error-400': '230 53 53',             // #e63535
    '--color-error-500': '239 68 68',             // #ef4444
    '--color-error-600': '249 97 96',             // #f96160
    '--color-error-700': '229 91 90',             // #e55b5a
    '--color-error-800': '254 202 202',           // #fecaca
    '--color-error-900': '254 226 226',           // #fee2e2
    '--color-error-950': '254 233 233',           // #fee9e9

    /* Success */
    '--color-success-0':   '6 10 0',              // #060a00
    '--color-success-50':  '10 17 1',             // #0a1101
    '--color-success-100': '14 22 2',             // #0e1602
    '--color-success-200': '17 27 2',             // #111b02
    '--color-success-300': '24 45 24',            // #182D1A
    '--color-success-400': '47 66 18',            // #2f4212
    '--color-success-500': '77 107 32',           // #4D6B20
    '--color-success-600': '93 128 12',           // #5D800C
    '--color-success-700': '126 172 22',          // #7EAC16
    '--color-success-800': '156 207 27',          // #9CCF1B
    '--color-success-900': '196 235 99',          // #c4eb63
    '--color-success-950': '227 255 158',         // #e3ff9e
  

    /* Warning */
    '--color-warning-0':   '14 22 2',             // #0e1602
    '--color-warning-50':  '17 27 2',             // #111b02
    '--color-warning-100': '24 45 24',            // #182D1A
    '--color-warning-200': '47 66 18',            // #2f4212
    '--color-warning-300': '77 107 32',           // #4D6B20
    '--color-warning-400': '93 128 12',           // #5D800C
    '--color-warning-500': '126 172 22',          // #7EAC16
    '--color-warning-600': '156 207 27',          // #9CCF1B
    '--color-warning-700': '196 235 99',          // #c4eb63
    '--color-warning-800': '227 255 158',         // #e3ff9e
    '--color-warning-900': '243 255 197',         // #f3ffc5
    '--color-warning-950': '255 255 245',         // #fffff5

    /* Info */
    '--color-info-0':   '3 38 56',                // #032638
    '--color-info-50':  '5 64 93',                // #05405d
    '--color-info-100': '7 90 131',               // #075a83
    '--color-info-200': '9 115 168',              // #0973a8
    '--color-info-300': '11 141 205',             // #0b8dcd
    '--color-info-400': '13 166 242',             // #0da6f2
    '--color-info-500': '50 180 244',             // #32b4f4
    '--color-info-600': '87 194 246',             // #57c2f6
    '--color-info-700': '124 207 248',            // #7ccff8
    '--color-info-800': '162 221 250',            // #a2ddfa
    '--color-info-900': '199 235 252',            // #c7ebfc
    '--color-info-950': '236 248 254',            // #ecf8fe

    /* Typography */
    '--color-typography-0':   '23 23 23',         // #171717
    '--color-typography-50':  '38 38 39',         // #262627
    '--color-typography-100': '64 64 64',         // #404040
    '--color-typography-200': '82 82 82',         // #525252
    '--color-typography-300': '115 115 115',      // #737373
    '--color-typography-400': '140 140 140',      // #8c8c8c
    '--color-typography-500': '163 163 163',      // #a3a3a3
    '--color-typography-600': '212 212 212',      // #d4d4d4
    '--color-typography-700': '219 219 220',      // #dbdbdc
    '--color-typography-800': '229 229 229',      // #e5e5e5
    '--color-typography-900': '245 245 245',      // #f5f5f5
    '--color-typography-950': '254 254 255',      // #fefeff

    /* Outline */
    '--color-outline-0':   '26 23 23',            // #1a1717
    '--color-outline-50':  '39 38 36',            // #272624
    '--color-outline-100': '65 65 65',            // #414141
    '--color-outline-200': '83 82 82',            // #535252
    '--color-outline-300': '115 116 116',         // #737474
    '--color-outline-400': '140 141 141',         // #8c8d8d
    '--color-outline-500': '165 163 163',         // #a5a3a3
    '--color-outline-600': '211 211 211',         // #d3d3d3
    '--color-outline-700': '221 220 219',         // #dddccb
    '--color-outline-800': '230 230 230',         // #e6e6e6
    '--color-outline-900': '243 243 243',         // #f3f3f3
    '--color-outline-950': '253 254 254',         // #fdfefe

    /* Background */
    '--color-background-0':   '30 30 30',         // #1e1e1e
    '--color-background-50':  '47 66 18',         // #2f4212
    '--color-background-100': '77 107 32',        // #4d6b20
    '--color-background-200': '93 128 12',        // #5d800c
    '--color-background-300': '104 148 17',       // #689411
    '--color-background-400': '141 180 22',       // #8db416
    '--color-background-500': '156 207 27',       // #9ccf1b
    '--color-background-600': '178 222 63',       // #b2de3f
    '--color-background-700': '196 235 99',       // #c4eb63
    '--color-background-800': '212 243 120',      // #d4f378
    '--color-background-900': '235 252 206',      // #ebfccc
    '--color-background-950': '255 255 255',      // #ffffff

    /* Background Special */
    '--color-background-error':   '255 153 153',  // #ff9999
    '--color-background-warning': '255 219 133',  // #ffdb85
    '--color-background-success': '196 235 99',   // #c4eb63
    '--color-background-muted':   '210 230 190',  // #d2e6be
    '--color-background-info':    '178 233 255',  // #b2e9ff

    /* Focus Ring Indicator  */
    '--color-indicator-primary':  '227 255 158',  // #e3ff9e
    '--color-indicator-info':     '178 233 255',  // #b2e9ff
    '--color-indicator-error':    '255 153 153',  // #ff9999
  }),

//////////////////////////////////// OLD COLORS ////////////////////////////////////

  // light: vars({
  //   '--color-primary-0': '179 179 179',
  //   '--color-primary-50': '153 153 153',
  //   '--color-primary-100': '128 128 128',
  //   '--color-primary-200': '115 115 115',
  //   '--color-primary-300': '102 102 102',
  //   '--color-primary-400': '82 82 82',
  //   '--color-primary-500': '51 51 51',
  //   '--color-primary-600': '41 41 41',
  //   '--color-primary-700': '31 31 31',
  //   '--color-primary-800': '13 13 13',
  //   '--color-primary-900': '10 10 10',
  //   '--color-primary-950': '8 8 8',

  //   /* Secondary  */
  //   '--color-secondary-0': '253 253 253',
  //   '--color-secondary-50': '251 251 251',
  //   '--color-secondary-100': '246 246 246',
  //   '--color-secondary-200': '242 242 242',
  //   '--color-secondary-300': '237 237 237',
  //   '--color-secondary-400': '230 230 231',
  //   '--color-secondary-500': '217 217 219',
  //   '--color-secondary-600': '198 199 199',
  //   '--color-secondary-700': '189 189 189',
  //   '--color-secondary-800': '177 177 177',
  //   '--color-secondary-900': '165 164 164',
  //   '--color-secondary-950': '157 157 157',

  //   /* Tertiary */
  //   '--color-tertiary-0': '255 250 245',
  //   '--color-tertiary-50': '255 242 229',
  //   '--color-tertiary-100': '255 233 213',
  //   '--color-tertiary-200': '254 209 170',
  //   '--color-tertiary-300': '253 180 116',
  //   '--color-tertiary-400': '251 157 75',
  //   '--color-tertiary-500': '231 129 40',
  //   '--color-tertiary-600': '215 117 31',
  //   '--color-tertiary-700': '180 98 26',
  //   '--color-tertiary-800': '130 73 23',
  //   '--color-tertiary-900': '108 61 19',
  //   '--color-tertiary-950': '84 49 18',

  //   /* Error */
  //   '--color-error-0': '254 233 233',
  //   '--color-error-50': '254 226 226',
  //   '--color-error-100': '254 202 202',
  //   '--color-error-200': '252 165 165',
  //   '--color-error-300': '248 113 113',
  //   '--color-error-400': '239 68 68',
  //   '--color-error-500': '230 53 53',
  //   '--color-error-600': '220 38 38',
  //   '--color-error-700': '185 28 28',
  //   '--color-error-800': '153 27 27',
  //   '--color-error-900': '127 29 29',
  //   '--color-error-950': '83 19 19',

  //   /* Success */
  //   '--color-success-0': '228 255 244',
  //   '--color-success-50': '202 255 232',
  //   '--color-success-100': '162 241 192',
  //   '--color-success-200': '132 211 162',
  //   '--color-success-300': '102 181 132',
  //   '--color-success-400': '72 151 102',
  //   '--color-success-500': '52 131 82',
  //   '--color-success-600': '42 121 72',
  //   '--color-success-700': '32 111 62',
  //   '--color-success-800': '22 101 52',
  //   '--color-success-900': '20 83 45',
  //   '--color-success-950': '27 50 36',

  //   /* Warning */
  //   '--color-warning-0': '255 249 245',
  //   '--color-warning-50': '255 244 236',
  //   '--color-warning-100': '255 231 213',
  //   '--color-warning-200': '254 205 170',
  //   '--color-warning-300': '253 173 116',
  //   '--color-warning-400': '251 149 75',
  //   '--color-warning-500': '231 120 40',
  //   '--color-warning-600': '215 108 31',
  //   '--color-warning-700': '180 90 26',
  //   '--color-warning-800': '130 68 23',
  //   '--color-warning-900': '108 56 19',
  //   '--color-warning-950': '84 45 18',

  //   /* Info */
  //   '--color-info-0': '236 248 254',
  //   '--color-info-50': '199 235 252',
  //   '--color-info-100': '162 221 250',
  //   '--color-info-200': '124 207 248',
  //   '--color-info-300': '87 194 246',
  //   '--color-info-400': '50 180 244',
  //   '--color-info-500': '13 166 242',
  //   '--color-info-600': '11 141 205',
  //   '--color-info-700': '9 115 168',
  //   '--color-info-800': '7 90 131',
  //   '--color-info-900': '5 64 93',
  //   '--color-info-950': '3 38 56',

  //   /* Typography */
  //   '--color-typography-0': '254 254 255',
  //   '--color-typography-50': '245 245 245',
  //   '--color-typography-100': '229 229 229',
  //   '--color-typography-200': '219 219 220',
  //   '--color-typography-300': '212 212 212',
  //   '--color-typography-400': '163 163 163',
  //   '--color-typography-500': '140 140 140',
  //   '--color-typography-600': '115 115 115',
  //   '--color-typography-700': '82 82 82',
  //   '--color-typography-800': '64 64 64',
  //   '--color-typography-900': '38 38 39',
  //   '--color-typography-950': '23 23 23',

  //   /* Outline */
  //   '--color-outline-0': '253 254 254',
  //   '--color-outline-50': '243 243 243',
  //   '--color-outline-100': '230 230 230',
  //   '--color-outline-200': '221 220 219',
  //   '--color-outline-300': '211 211 211',
  //   '--color-outline-400': '165 163 163',
  //   '--color-outline-500': '140 141 141',
  //   '--color-outline-600': '115 116 116',
  //   '--color-outline-700': '83 82 82',
  //   '--color-outline-800': '65 65 65',
  //   '--color-outline-900': '39 38 36',
  //   '--color-outline-950': '26 23 23',

  //   /* Background */
  //   '--color-background-0': '255 255 255',
  //   '--color-background-50': '246 246 246',
  //   '--color-background-100': '242 241 241',
  //   '--color-background-200': '220 219 219',
  //   '--color-background-300': '213 212 212',
  //   '--color-background-400': '162 163 163',
  //   '--color-background-500': '142 142 142',
  //   '--color-background-600': '116 116 116',
  //   '--color-background-700': '83 82 82',
  //   '--color-background-800': '65 64 64',
  //   '--color-background-900': '39 38 37',
  //   '--color-background-950': '18 18 18',

  //   /* Background Special */
  //   '--color-background-error': '254 241 241',
  //   '--color-background-warning': '255 243 234',
  //   '--color-background-success': '237 252 242',
  //   '--color-background-muted': '247 248 247',
  //   '--color-background-info': '235 248 254',

  //   /* Focus Ring Indicator  */
  //   '--color-indicator-primary': '55 55 55',
  //   '--color-indicator-info': '83 153 236',
  //   '--color-indicator-error': '185 28 28',
  // }),

  // dark: vars({
  //   '--color-primary-0': '166 166 166',
  //   '--color-primary-50': '175 175 175',
  //   '--color-primary-100': '186 186 186',
  //   '--color-primary-200': '197 197 197',
  //   '--color-primary-300': '212 212 212',
  //   '--color-primary-400': '221 221 221',
  //   '--color-primary-500': '230 230 230',
  //   '--color-primary-600': '240 240 240',
  //   '--color-primary-700': '250 250 250',
  //   '--color-primary-800': '253 253 253',
  //   '--color-primary-900': '254 249 249',
  //   '--color-primary-950': '253 252 252',

  //   /* Secondary  */
  //   '--color-secondary-0': '20 20 20',
  //   '--color-secondary-50': '23 23 23',
  //   '--color-secondary-100': '31 31 31',
  //   '--color-secondary-200': '39 39 39',
  //   '--color-secondary-300': '44 44 44',
  //   '--color-secondary-400': '56 57 57',
  //   '--color-secondary-500': '63 64 64',
  //   '--color-secondary-600': '86 86 86',
  //   '--color-secondary-700': '110 110 110',
  //   '--color-secondary-800': '135 135 135',
  //   '--color-secondary-900': '150 150 150',
  //   '--color-secondary-950': '164 164 164',

  //   /* Tertiary */
  //   '--color-tertiary-0': '84 49 18',
  //   '--color-tertiary-50': '108 61 19',
  //   '--color-tertiary-100': '130 73 23',
  //   '--color-tertiary-200': '180 98 26',
  //   '--color-tertiary-300': '215 117 31',
  //   '--color-tertiary-400': '231 129 40',
  //   '--color-tertiary-500': '251 157 75',
  //   '--color-tertiary-600': '253 180 116',
  //   '--color-tertiary-700': '254 209 170',
  //   '--color-tertiary-800': '255 233 213',
  //   '--color-tertiary-900': '255 242 229',
  //   '--color-tertiary-950': '255 250 245',

  //   /* Error */
  //   '--color-error-0': '83 19 19',
  //   '--color-error-50': '127 29 29',
  //   '--color-error-100': '153 27 27',
  //   '--color-error-200': '185 28 28',
  //   '--color-error-300': '220 38 38',
  //   '--color-error-400': '230 53 53',
  //   '--color-error-500': '239 68 68',
  //   '--color-error-600': '249 97 96',
  //   '--color-error-700': '229 91 90',
  //   '--color-error-800': '254 202 202',
  //   '--color-error-900': '254 226 226',
  //   '--color-error-950': '254 233 233',

  //   /* Success */
  //   '--color-success-0': '27 50 36',
  //   '--color-success-50': '20 83 45',
  //   '--color-success-100': '22 101 52',
  //   '--color-success-200': '32 111 62',
  //   '--color-success-300': '42 121 72',
  //   '--color-success-400': '52 131 82',
  //   '--color-success-500': '72 151 102',
  //   '--color-success-600': '102 181 132',
  //   '--color-success-700': '132 211 162',
  //   '--color-success-800': '162 241 192',
  //   '--color-success-900': '202 255 232',
  //   '--color-success-950': '228 255 244',

  //   /* Warning */
  //   '--color-warning-0': '84 45 18',
  //   '--color-warning-50': '108 56 19',
  //   '--color-warning-100': '130 68 23',
  //   '--color-warning-200': '180 90 26',
  //   '--color-warning-300': '215 108 31',
  //   '--color-warning-400': '231 120 40',
  //   '--color-warning-500': '251 149 75',
  //   '--color-warning-600': '253 173 116',
  //   '--color-warning-700': '254 205 170',
  //   '--color-warning-800': '255 231 213',
  //   '--color-warning-900': '255 244 237',
  //   '--color-warning-950': '255 249 245',

  //   /* Info */
  //   '--color-info-0': '3 38 56',
  //   '--color-info-50': '5 64 93',
  //   '--color-info-100': '7 90 131',
  //   '--color-info-200': '9 115 168',
  //   '--color-info-300': '11 141 205',
  //   '--color-info-400': '13 166 242',
  //   '--color-info-500': '50 180 244',
  //   '--color-info-600': '87 194 246',
  //   '--color-info-700': '124 207 248',
  //   '--color-info-800': '162 221 250',
  //   '--color-info-900': '199 235 252',
  //   '--color-info-950': '236 248 254',

  //   /* Typography */
  //   '--color-typography-0': '23 23 23',
  //   '--color-typography-50': '38 38 39',
  //   '--color-typography-100': '64 64 64',
  //   '--color-typography-200': '82 82 82',
  //   '--color-typography-300': '115 115 115',
  //   '--color-typography-400': '140 140 140',
  //   '--color-typography-500': '163 163 163',
  //   '--color-typography-600': '212 212 212',
  //   '--color-typography-700': '219 219 220',
  //   '--color-typography-800': '229 229 229',
  //   '--color-typography-900': '245 245 245',
  //   '--color-typography-950': '254 254 255',

  //   /* Outline */
  //   '--color-outline-0': '26 23 23',
  //   '--color-outline-50': '39 38 36',
  //   '--color-outline-100': '65 65 65',
  //   '--color-outline-200': '83 82 82',
  //   '--color-outline-300': '115 116 116',
  //   '--color-outline-400': '140 141 141',
  //   '--color-outline-500': '165 163 163',
  //   '--color-outline-600': '211 211 211',
  //   '--color-outline-700': '221 220 219',
  //   '--color-outline-800': '230 230 230',
  //   '--color-outline-900': '243 243 243',
  //   '--color-outline-950': '253 254 254',

  //   /* Background */
  //   '--color-background-0': '18 18 18',
  //   '--color-background-50': '39 38 37',
  //   '--color-background-100': '65 64 64',
  //   '--color-background-200': '83 82 82',
  //   '--color-background-300': '116 116 116',
  //   '--color-background-400': '142 142 142',
  //   '--color-background-500': '162 163 163',
  //   '--color-background-600': '213 212 212',
  //   '--color-background-700': '229 228 228',
  //   '--color-background-800': '242 241 241',
  //   '--color-background-900': '246 246 246',
  //   '--color-background-950': '255 255 255',

  //   /* Background Special */
  //   '--color-background-error': '66 43 43',
  //   '--color-background-warning': '65 47 35',
  //   '--color-background-success': '28 43 33',
  //   '--color-background-muted': '51 51 51',
  //   '--color-background-info': '26 40 46',

  //   /* Focus Ring Indicator  */
  //   '--color-indicator-primary': '247 247 247',
  //   '--color-indicator-info': '161 199 245',
  //   '--color-indicator-error': '232 70 69',
  // }),
};