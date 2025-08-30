import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Membership Service Member' })
export class MembershipServiceMemberGqlOutput {
  @Field(() => String, { name: 'id', nullable: true })
  _id?: string;

  @Field(() => String)
  tenantId!: string;

  @Field(() => String)
  userId!: string;

  @Field(() => String)
  loyaltyProgramId!: string;

  @Field(() => String)
  currentTierId!: string;

  @Field(() => String)
  currentTierName!: string;

  @Field(() => Int)
  currentTierLevel!: number;

  @Field(() => String)
  membershipNumber!: string;

  @Field(() => Date)
  joinDate!: Date;

  @Field(() => Int, { defaultValue: 0 })
  lifetimePoints?: number;

  @Field(() => Int, { defaultValue: 0 })
  availablePoints?: number;

  @Field(() => Float, { defaultValue: 0 })
  cumulativeSpending?: number;

  @Field(() => Float, { defaultValue: 0 })
  currentYearSpending?: number;

  @Field(() => String, { nullable: true })
  nextTierId?: string;

  @Field(() => String, { nullable: true })
  nextTierName?: string;

  @Field(() => Int, { defaultValue: 0 })
  pointsToNextTier?: number;

  @Field(() => Float, { defaultValue: 0 })
  spendingToNextTier?: number;

  @Field(() => Date, { nullable: true })
  tierExpiryDate?: Date;

  @Field(() => Boolean, { defaultValue: true })
  isActive?: boolean;

  @Field(() => Boolean, { defaultValue: false })
  isDeleted?: boolean;

  @Field(() => Date, { nullable: true })
  createdAt?: Date;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;
}

export class MembershipServiceMemberOutput extends MembershipServiceMemberGqlOutput {}
