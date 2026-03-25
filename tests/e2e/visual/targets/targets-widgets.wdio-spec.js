const utils = require('@utils');
const commonPage = require('@page-objects/default/common/common.wdio.page');
const loginPage = require('@page-objects/default/login/login.wdio.page');
const pregnancyVisitFactory = require('@factories/cht/reports/pregnancy-visit');
const userFactory = require('@factories/cht/users/users');
const placeFactory = require('@factories/cht/contacts/place');
const personFactory = require('@factories/cht/contacts/person');
const deliveryFactory = require('@factories/cht/reports/delivery');
const pregnancyFactory = require('@factories/cht/reports/pregnancy');
const { generateScreenshot } = require('@utils/screenshots');

describe('Targets widgets', () => {
  const places = placeFactory.generateHierarchy();
  const healthCenter = places.get('health_center');

  const offlineUser = userFactory.build({
    username: 'offline-user-targets-widgets',
    roles: ['chw'],
    place: healthCenter._id
  });

  const numberOfPatients = 17;
  const patients = Array.from({ length: numberOfPatients }, () =>
    personFactory.build({
      parent: { _id: healthCenter._id, parent: healthCenter.parent }
    })
  );

  const reports = [
    // 10 basic pregnancies → populates "Active Pregnancies" count widget
    ...patients.slice(0, 10).map(patient =>
      pregnancyFactory.build({
        fields: {
          patient_id: patient._id,
          patient_uuid: patient._id,
          patient_name: patient.name
        }
      })
    ),

    // 5 pregnancies with 0 ANC visits → contributes to percent widget
    ...patients.slice(10, 15).map(patient =>
      pregnancyFactory.build({
        fields: {
          patient_id: patient._id,
          patient_uuid: patient._id,
          patient_name: patient.name,
          anc_visits_hf: {
            anc_visits_hf_past: {
              visited_hf_count: '0',
            }
          }
        }
      })
    ),

    // 2 pregnancies with 5 ANC visits → passes "4+ visits" percent goal
    ...patients.slice(15, 17).map(patient =>
      pregnancyFactory.build({
        fields: {
          patient_id: patient._id,
          patient_uuid: patient._id,
          patient_name: patient.name,
          anc_visits_hf: {
            anc_visits_hf_past: {
              visited_hf_count: '5',
            }
          }
        }
      })
    ),

    // 2 pregnancy visits → populates visit count widget
    pregnancyVisitFactory.build({
      fields: {
        patient_id: patients[15]._id,
        patient_uuid: patients[15]._id,
        patient_name: patients[15].name
      },
    }),
    pregnancyVisitFactory.build({
      fields: {
        patient_id: patients[15]._id,
        patient_uuid: patients[15]._id,
        patient_name: patients[15].name
      },
    }),

    // 2 facility deliveries
    deliveryFactory.build({
      fields: {
        patient_id: patients[1]._id,
        patient_uuid: patients[1]._id,
        patient_name: patients[1].name
      },
    }),
    deliveryFactory.build({
      fields: {
        patient_id: patients[2]._id,
        patient_uuid: patients[2]._id,
        patient_name: patients[2].name
      },
    }),

    // 1 home delivery → shows "home vs facility" percent widget split
    deliveryFactory.build({
      fields: {
        patient_id: patients[3]._id,
        patient_uuid: patients[3]._id,
        patient_name: patients[3].name,
        delivery_outcome: {
          delivery_place: 'home'
        },
        data: {
          __delivery_place: 'home'
        }
      },
    }),
  ];

  before(async () => {
    await utils.saveDocs([...places.values(), ...reports, ...patients]);
    await utils.createUsers([offlineUser]);
    await loginPage.login(offlineUser);
  });

  after(async () => {
    await utils.revertDb([/^form:/], true);
    await utils.deleteUsers([offlineUser]);
  });

  it('should go to Targets and take screenshot of widgets', async () => {
    await commonPage.waitForPageLoaded();
    await commonPage.goToAnalytics();
    await commonPage.waitForPageLoaded();
    await browser.pause(2000);
    await generateScreenshot('targets', 'widgets');
  });
});