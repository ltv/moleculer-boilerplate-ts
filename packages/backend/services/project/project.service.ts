import { Context, GraphQLMutationInput, GraphQLQueryInput } from '@app/types';
import { Project } from '@prisma/client';
import { GraphQLService } from 'core';
import { Errors } from 'moleculer';
import { Action, Service } from 'moleculer-decorators';
import { ERR_EXT, SVC_PROJECT, SVC_PROJECT_DB, SVC_USER_DB } from 'utils/constants';

const { MoleculerClientError } = Errors;

@Service({
  name: SVC_PROJECT,
  settings: {
    graphql: {
      type: `
        extend type Project {
          owner: User!
          members: [User!]
        }
      `,
      resolvers: {
        ProjectsConnection: {
          totalCount: {
            action: `${SVC_PROJECT_DB}.count`,
            rootParams: { first: 'first' }
          }
        },

        Project: {
          owner: {
            action: `${SVC_USER_DB}.findById`,
            rootParams: { createdBy: 'id' }
            // dataLoader: true // TODO: Check some examples to make sure the right way of using DataLoader
          },
          members: {
            action: `${SVC_PROJECT_DB}.getProjectMembers`,
            rootParams: { id: 'id' }
          }
        }
      }
    }
  }
})
export default class ProjectService extends GraphQLService {
  /**
   * Get all projects
   * @param Project
   * return [Project]
   */
  @Action({
    name: 'list',
    graphql: {
      query: `
        # Reads and enables pagination through a set of 'Project'.
        allProjects(
          # Only read the first 'n' values of the set.
          first: Int

          # Only read the last 'n' values of the set.
          last: Int

          # Skip the first 'n' values from our 'after' cursor, an alternative to cursor
          # based pagination. May not be used with 'last'.
          offset: Int

          # Read all values in the set before (above) this cursor.
          before: Cursor

          # Read all values in the set after (below) this cursor.
          after: Cursor

          # The method to use when ordering 'Project'.
          orderBy: [ProjectsOrderBy!] = [PRIMARY_KEY_ASC]

          # A condition to be used in determining which values should be returned by the collection.
          condition: ProjectCondition

          # A filter to be used in determining which values should be returned by the collection.
          filter: ProjectFilter
        ): ProjectsConnection
      `
    }
  })
  async actAllProjects(ctx: Context<GraphQLQueryInput<Project>>) {
    const projects: Project[] = await ctx.call(`${SVC_PROJECT_DB}.find`, {});
    return this.transformPayload('project', projects);
  }

  /**
   * get project by id
   * @param id {number}
   * return Project
   */
  @Action({ name: 'get' })
  getProject(ctx: Context<{ id: number }>) {
    const { id } = ctx.params;
    return ctx.call(`${SVC_PROJECT_DB}.findById`, { id });
  }

  /**
   * Create project
   * @param Project
   * return Project
   */
  @Action({
    name: 'create',
    graphql: {
      mutation: `
        # Creates a single 'Project'.
        createProject(
          # The exclusive input argument for this mutation. An object type, make sure to see documentation for this object’s fields.
          input: CreateProjectInput!
        ): CreateProjectPayload
      `
    }
  })
  async createProject(ctx: Context<GraphQLMutationInput<Project>>) {
    const pjtInp = ctx.params.input.project;
    const existingProject: Project[] = await ctx.call(`${SVC_PROJECT_DB}.actCheckExisted`, pjtInp);
    if (existingProject.length > 0) {
      throw new MoleculerClientError('Project Name or Code is existed', 400, ERR_EXT);
    }
    const project: Project = await ctx.call(`${SVC_PROJECT_DB}.create`, {
      entity: { ...pjtInp, users: { create: { user: { connect: { id: ctx.meta.userId } } } } }
    });
    return this.transformPayload('project', project);
  }

  /**
   * Update project
   * @param Project
   * return Project
   */
  @Action({ name: 'update' })
  updateProject(ctx: Context<Project>) {
    const { id, ...entity } = ctx.params;
    return ctx.call(`${SVC_PROJECT_DB}.updateById`, { entity, id });
  }

  /**
   * Remove project
   * @param id {number}
   * return Project
   */
  @Action({ name: 'remove' })
  removeProject(ctx: Context<Project>) {
    const { id } = ctx.params;
    return ctx.call(`${SVC_PROJECT_DB}.deleteById`, { id });
  }

  /**
   * Archived project
   * @param id {number}
   * return project
   */
  @Action({ name: 'archived' })
  archivedProject(ctx: Context<{ id: number }>) {
    const { id } = ctx.params;
    return ctx.call(`${SVC_PROJECT_DB}.updateById`, { id, entity: { archived: true } });
  }
}
