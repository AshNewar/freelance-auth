import { IAuthDocument } from '@ashnewar/helper-library';
import { sequelize } from '@auth/database';
import { DataTypes, Model, ModelDefined, Optional } from 'sequelize';
import {compare, hash} from 'bcrypt';


type AuthUserCreationAttributes = Optional<IAuthDocument, 'id' | 'createdAt' | 'passwordResetToken' | 'passwordResetExpires'>;

const SALT_ROUNDS = 10;

const authModel: ModelDefined<IAuthDocument , AuthUserCreationAttributes> = sequelize.define('auth', {
    username:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    password:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    profilePublicId:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    email:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    country:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    profilePicture:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    emailVerificationToken:{
        type: DataTypes.STRING,
        allowNull: true,
    },
    emailVerified:{
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 0,
    },
    createdAt:{
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Date.now(),
    },
    passwordResetToken:{
        type: DataTypes.STRING,
        allowNull: true,
    },
    passwordResetExpires:{
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Date.now(),
    }
},{
    indexes:[
        {
            unique:true,
            fields:['username','email']
        }
    ]
});

authModel.addHook('beforeCreate', async(auth: Model) => {
    const hashPassword = await hash(auth.dataValues.password as string ,SALT_ROUNDS);
    auth.dataValues.password = hashPassword;
});

authModel.prototype.comparePassword = async (password :string , hashPassword :string ): Promise<boolean>=>{
    return compare(password,hashPassword);
};

authModel.prototype.hashPassword = async (password :string): Promise<string>=>{
    return hash(password,SALT_ROUNDS);
};

if(process.env.NODE_ENV !== 'test'){
    authModel.sync({});
}

export {authModel};
