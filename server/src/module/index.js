import configStatisticRoutes from './statistic';
import configDataCollectorRoutes from './data-collector';
import configDomRoutes from './dom-handler';
import configLibRoutes from './lib';

export default app => {
  configStatisticRoutes(app);
  configDataCollectorRoutes(app);
  configDomRoutes(app);
  configLibRoutes(app);
};
