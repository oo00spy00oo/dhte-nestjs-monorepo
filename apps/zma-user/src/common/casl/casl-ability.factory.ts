import {
  Ability,
  AbilityBuilder,
  AbilityClass,
  ExtractSubjectType,
  InferSubjects,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { AuthenticatedUser } from '@zma-nestjs-monorepo/zma-types';
import { UserServiceUser } from '@zma-nestjs-monorepo/zma-types/outputs/user/user';

import { Action } from '../../core/types';

type Subjects = InferSubjects<typeof UserServiceUser> | 'all';

export type AppAbility = Ability<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: AuthenticatedUser) {
    const { can, cannot, build } = new AbilityBuilder<Ability<[Action, Subjects]>>(
      Ability as AbilityClass<AppAbility>,
    );

    cannot(Action.Delete, 'all');

    // if (user.role === UserRole.SuperAdmin) {
    //   can(Action.Manage, 'all');
    // } else if (user.role === UserRole.Admin) {
    //   can(Action.Manage, User);
    // } else {
    //   can(Action.Read, 'all');
    // }

    return build({
      // Read https://casl.js.org/v6/en/guide/subject-type-detection#use-classes-as-subject-types for details
      detectSubjectType: (item) => item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
