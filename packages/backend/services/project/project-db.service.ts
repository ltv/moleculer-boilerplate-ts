import { Context } from '@ltv/moleculer-core';
import { Project, ProjectDelegate } from '@prisma/client';
import { PrismaService } from 'core';
import { PrismaMixin } from 'mixins/prisma.mixin';
import { Action, Service } from 'moleculer-decorators';
import { SVC_PROJECT_DB } from 'utils/constants';

@Service({
  name: SVC_PROJECT_DB,
  mixins: [
    PrismaMixin<ProjectDelegate, Project>({
      prisma: {
        model: prisma => prisma.project
      }
    })
  ]
})
export default class ProjectDBService extends PrismaService<ProjectDelegate> {
  @Action({
    name: 'actCheckExisted'
  })
  actCheckExisted(ctx: Context<Project>) {
    const { name, code } = ctx.params;
    return this.model().findMany({ where: { OR: [{ name }, { code }] } });
  }

  @Action({ name: 'getProjectMembers', params: { id: 'number' }, cache: { keys: ['id'] } })
  actGetProjectMembers(ctx: Context<Project>) {
    return this.model()
      .findOne({ where: { id: ctx.params.id } })
      .users()
      .then(uOnPs =>
        this.prisma.user.findMany({ where: { id: { in: uOnPs.map(u => u.userId) } } })
      );
  }
}
